
const source = '<svg width="100%">';
const fixed = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
console.log("Original: " + source);
console.log("Replaced: " + fixed);
if (fixed.indexOf('"width') !== -1) {
    console.log("FAIL: Missing space confirmed.");
} else {
    console.log("PASS: Space exists.");
}
