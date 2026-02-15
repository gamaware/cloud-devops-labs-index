#!/usr/bin/env node

/**
 * Test runner — executes all *.test.js files in the tests/ directory
 * and reports aggregated results.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const testsDir = __dirname;
const testFiles = fs.readdirSync(testsDir)
    .filter(f => f.endsWith('.test.js'))
    .sort();

if (testFiles.length === 0) {
    console.log('No test files found.');
    process.exit(0);
}

console.log(`\n🧪 Running ${testFiles.length} test file(s)...\n`);

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const file of testFiles) {
    const filePath = path.join(testsDir, file);
    const label = file.replace('.test.js', '');

    try {
        const output = execSync(`node "${filePath}"`, {
            encoding: 'utf8',
            timeout: 30000,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Parse pass/fail counts from output (format: "N passed, M failed")
        const match = output.match(/(\d+) passed, (\d+) failed/);
        const p = match ? parseInt(match[1], 10) : 0;
        const f = match ? parseInt(match[2], 10) : 0;
        totalPassed += p;
        totalFailed += f;

        results.push({ file: label, passed: p, failed: f, error: null });
        console.log(`  ✓ ${label} (${p} passed)`);
    } catch (err) {
        const output = (err.stdout || '') + (err.stderr || '');
        const match = output.match(/(\d+) passed, (\d+) failed/);
        const p = match ? parseInt(match[1], 10) : 0;
        const f = match ? parseInt(match[2], 10) : 0;
        totalPassed += p;
        totalFailed += f || 1;

        results.push({ file: label, passed: p, failed: f || 1, error: output.trim() });
        console.log(`  ✗ ${label} (${f || 1} failed)`);
    }
}

console.log(`\n${'─'.repeat(40)}`);
console.log(`Total: ${totalPassed} passed, ${totalFailed} failed (${testFiles.length} files)`);
console.log(`${'─'.repeat(40)}\n`);

if (totalFailed > 0) {
    console.log('Failed test details:\n');
    for (const r of results) {
        if (r.failed > 0 && r.error) {
            console.log(`--- ${r.file} ---`);
            console.log(r.error);
            console.log('');
        }
    }
}

process.exit(totalFailed > 0 ? 1 : 0);
