import { getImagePath } from './src/utils/imageHelper';

console.log('=== Testing Image Helper ===\n');

// Test 1: Short Google Drive ID (17 chars)
const url1 = "https://drive.google.com/uc?export=view&id=1SOE1iD0geRug7XJ2";
console.log('Test 1: Short ID (17 chars)');
console.log('  Input:', url1);
console.log('  Output:', getImagePath(url1));
console.log('  Expected: https://drive.google.com/thumbnail?id=1SOE1iD0geRug7XJ2&sz=w1000');
console.log();

// Test 2: Dashed ID
const url2 = "https://drive.google.com/file/d/1-ABC_123-XYZ_789/view";
console.log('Test 2: Dashed ID');
console.log('  Input:', url2);
console.log('  Output:', getImagePath(url2));
console.log('  Expected: https://drive.google.com/thumbnail?id=1-ABC_123-XYZ_789&sz=w1000');
console.log();

// Test 3: Non-Drive URL
const url3 = "https://example.com/image.jpg";
console.log('Test 3: Non-Drive URL');
console.log('  Input:', url3);
console.log('  Output:', getImagePath(url3));
console.log('  Expected:', url3);
console.log();

// Test 4: Random string (not a URL)
const url4 = "Just a filename.jpg";
console.log('Test 4: Random string');
console.log('  Input:', url4);
console.log('  Output:', getImagePath(url4));
console.log('  Expected: /no-image.png');
console.log();

// Test 5: googleusercontent URL
const url5 = "https://lh3.googleusercontent.com/d/1SOE1iD0geRug7XJ2";
console.log('Test 5: googleusercontent URL');
console.log('  Input:', url5);
console.log('  Output:', getImagePath(url5));
console.log('  Expected: https://drive.google.com/thumbnail?id=1SOE1iD0geRug7XJ2&sz=w1000');
