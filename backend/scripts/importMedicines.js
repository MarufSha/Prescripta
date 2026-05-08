/**
 * Medicine data ingestion script
 *
 * Usage:
 *   node backend/scripts/importMedicines.js <path-to-tsv-or-csv-file>
 *
 * Options:
 *   --delimiter <char>   Column separator (default: \t for TSV, auto-detected from extension)
 *   --dry-run            Parse and validate without writing to DB
 *
 * Examples:
 *   node backend/scripts/importMedicines.js data/medicines.tsv
 *   node backend/scripts/importMedicines.js data/medicines.csv --delimiter ,
 *   node backend/scripts/importMedicines.js data/medicines.tsv --dry-run
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import readline from "readline";
import mongoose from "mongoose";
import { Medicine } from "../models/medicine.js";

// ─── Price parser ─────────────────────────────────────────────────────────────
// Handles formats like:
//   ৳ 40.27 (2 x 6: ৳ 483.24)/Unit
//   ৳ 40.27
//   40.27

function parsePrice(raw) {
  if (!raw) return { raw: null, unitPrice: null, packPrice: null, packInfo: null };

  const cleaned = raw.trim();

  // Full format: ৳ <unitPrice> (<packInfo>: ৳ <packPrice>)/Unit
  const fullMatch = cleaned.match(/[৳৳]\s*([\d,]+\.?\d*)\s*\(([^:]+):\s*[৳৳]\s*([\d,]+\.?\d*)\)/);
  if (fullMatch) {
    return {
      raw: cleaned,
      unitPrice: parseFloat(fullMatch[1].replace(/,/g, "")),
      packInfo: fullMatch[2].trim(),
      packPrice: parseFloat(fullMatch[3].replace(/,/g, "")),
    };
  }

  // Simple format: ৳ <price>
  const simpleMatch = cleaned.match(/[৳৳]\s*([\d,]+\.?\d*)/);
  if (simpleMatch) {
    return {
      raw: cleaned,
      unitPrice: parseFloat(simpleMatch[1].replace(/,/g, "")),
      packInfo: null,
      packPrice: null,
    };
  }

  // Plain number
  const numMatch = cleaned.match(/^([\d,]+\.?\d*)$/);
  if (numMatch) {
    return {
      raw: cleaned,
      unitPrice: parseFloat(numMatch[1].replace(/,/g, "")),
      packInfo: null,
      packPrice: null,
    };
  }

  return { raw: cleaned, unitPrice: null, packPrice: null, packInfo: null };
}

// ─── Arg parsing ─────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { filePath: null, delimiter: null, dryRun: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") {
      opts.dryRun = true;
    } else if (args[i] === "--delimiter" && args[i + 1]) {
      opts.delimiter = args[++i];
    } else if (!args[i].startsWith("--")) {
      opts.filePath = args[i];
    }
  }

  if (!opts.delimiter) {
    opts.delimiter = opts.filePath?.endsWith(".csv") ? "," : "\t";
  }

  return opts;
}

// ─── Column mapper ────────────────────────────────────────────────────────────
// Maps header row column names to our schema fields (case-insensitive, flexible)

const COLUMN_MAP = {
  company_name: "companyName",
  company: "companyName",
  medicine_name: "medicineName",
  brand_name: "medicineName",
  name: "medicineName",
  generic_name: "genericName",
  generic: "genericName",
  strength: "strength",
  dosage_form: "dosageForm",
  form: "dosageForm",
  price: "price",
  url: "url",
  link: "url",
};

function buildColumnIndex(headers, delimiter) {
  const index = {};
  headers.split(delimiter).forEach((h, i) => {
    const key = h.trim().toLowerCase().replace(/\s+/g, "_");
    const field = COLUMN_MAP[key];
    if (field) index[field] = i;
  });
  return index;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { filePath, delimiter, dryRun } = parseArgs();

  if (!filePath) {
    console.error("Error: provide a file path.");
    console.error("Usage: node backend/scripts/importMedicines.js <file> [--delimiter <char>] [--dry-run]");
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`Error: file not found — ${absPath}`);
    process.exit(1);
  }

  if (!dryRun) {
    if (!process.env.MONGO_URI) {
      console.error("Error: MONGO_URI is not set. Check your .env file.");
      process.exit(1);
    }
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
    console.log("Connected.\n");
  } else {
    console.log("DRY RUN — no data will be written.\n");
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(absPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let lineNum = 0;
  let colIndex = null;
  let parsed = 0;
  let invalid = 0;
  let batch = [];
  const BATCH_SIZE = 200;

  let upserted = 0;
  let modified = 0;
  let unchanged = 0;

  const flushBatch = async () => {
    if (!batch.length) return;
    if (!dryRun) {
      const ops = batch.map((doc) => ({
        updateOne: {
          filter: {
            medicineName: doc.medicineName,
            companyName: doc.companyName,
            strength: doc.strength,
            dosageForm: doc.dosageForm,
          },
          update: { $set: doc },
          upsert: true,
        },
      }));
      try {
        const res = await Medicine.bulkWrite(ops, { ordered: false });
        upserted += res.upsertedCount;
        modified += res.modifiedCount;
        unchanged += res.matchedCount - res.modifiedCount;
      } catch (err) {
        // BulkWriteError may contain partial results
        if (err.result) {
          upserted += err.result.nUpserted ?? 0;
          modified += err.result.nModified ?? 0;
        }
        console.error(`\nBatch write error: ${err.message}`);
      }
    }
    batch = [];
  };

  for await (const line of rl) {
    lineNum++;
    if (!line.trim()) continue;

    // First non-empty line is the header
    if (lineNum === 1) {
      colIndex = buildColumnIndex(line, delimiter);
      const found = Object.keys(colIndex);
      if (!colIndex.medicineName || !colIndex.companyName) {
        console.error(`Could not find required columns. Detected: [${found.join(", ")}]`);
        console.error("Expected columns: medicine_name (or brand_name), company_name (or company)");
        process.exit(1);
      }
      console.log(`Columns mapped: ${found.join(", ")}`);
      console.log(`Delimiter: ${delimiter === "\t" ? "\\t (TSV)" : `"${delimiter}" (CSV)`}\n`);
      continue;
    }

    const cols = line.split(delimiter);

    const medicineName = cols[colIndex.medicineName]?.trim();
    const companyName = cols[colIndex.companyName]?.trim();

    if (!medicineName || !companyName) {
      invalid++;
      continue;
    }

    batch.push({
      companyName,
      medicineName,
      genericName: cols[colIndex.genericName]?.trim() ?? "",
      strength: cols[colIndex.strength]?.trim() ?? "",
      dosageForm: cols[colIndex.dosageForm]?.trim() ?? "",
      price: parsePrice(cols[colIndex.price]),
      url: cols[colIndex.url]?.trim() ?? "",
    });

    parsed++;

    if (batch.length >= BATCH_SIZE) {
      await flushBatch();
      process.stdout.write(`\r  Processed ${parsed.toLocaleString()} rows...`);
    }
  }

  await flushBatch();

  const total = dryRun ? null : await Medicine.countDocuments();

  console.log(`\n\n${"─".repeat(50)}`);
  console.log(`  File:           ${absPath}`);
  console.log(`  Rows parsed:    ${parsed.toLocaleString()}`);
  console.log(`  Rows skipped:   ${invalid.toLocaleString()} (missing required fields)`);
  if (!dryRun) {
    console.log(`  Inserted (new): ${upserted.toLocaleString()}`);
    console.log(`  Updated:        ${modified.toLocaleString()}`);
    console.log(`  Unchanged:      ${unchanged.toLocaleString()}`);
    console.log(`  Total in DB:    ${total.toLocaleString()}`);
  }
  console.log("─".repeat(50));
  console.log(dryRun ? "Dry run complete. No data written." : "Import complete!");

  if (!dryRun) await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
