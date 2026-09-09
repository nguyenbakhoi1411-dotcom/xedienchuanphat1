const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'src', 'features');
const backendDir = path.join(__dirname, '..', 'src', 'main', 'java', 'com', 'chuanphat', 'warranty');

// 1. Find all frontend API calls
const frontendApis = new Set();
function scanFrontend(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanFrontend(fullPath);
        } else if (file === 'api.ts') {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const matches = content.matchAll(/api\.(get|post|put|patch|delete)(?:<.*?>)?\(\s*[`'"](\/api\/.*?)(\?|[`'"])/g);
            for (const match of matches) {
                let p = match[2];
                // Replace string interpolation ${...} with {param} to match Spring Boot style roughly
                p = p.replace(/\$\{[^}]+\}/g, '{param}');
                frontendApis.add(match[1].toUpperCase() + ' ' + p);
            }
        }
    }
}
scanFrontend(frontendDir);

// 2. Find all backend endpoints
const backendApis = [];
function scanBackend(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanBackend(fullPath);
        } else if (file.endsWith('Controller.java')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            // Find class level @RequestMapping
            const classMappingMatch = content.match(/@RequestMapping\(\s*["']([^"']+)["']/);
            const classPrefix = classMappingMatch ? classMappingMatch[1] : '';

            // Find method level mappings
            const methodRegex = /@(Get|Post|Put|Patch|Delete)Mapping\((?:value\s*=\s*)?["']([^"']*)["']/g;
            let match;
            while ((match = methodRegex.exec(content)) !== null) {
                const method = match[1].toUpperCase();
                let p = classPrefix + match[2];
                p = p.replace(/\/+/g, '/'); // normalize slashes
                // Replace {someVar} with {param} to match frontend normalized
                p = p.replace(/\{[^}]+\}/g, '{param}');
                backendApis.push(method + ' ' + p);
            }
            // Also match mappings with no explicit path: @GetMapping
            const emptyMethodRegex = /@(Get|Post|Put|Patch|Delete)Mapping(?:\(\))?(?!\()/g;
            while ((match = emptyMethodRegex.exec(content)) !== null) {
                const method = match[1].toUpperCase();
                let p = classPrefix;
                p = p.replace(/\/+/g, '/');
                backendApis.push(method + ' ' + p);
            }
        }
    }
}
scanBackend(backendDir);

// 3. Find frontend APIs without matching backend APIs
console.log('--- MISSING BACKEND ENDPOINTS ---');
let missingCount = 0;
for (const feApi of frontendApis) {
    // We do a loose match because path variable names might differ or regex parsing isn't perfect
    const method = feApi.split(' ')[0];
    const fePath = feApi.split(' ')[1];
    
    // Convert /api/v1/something/{param}/other to a regex
    const regexStr = '^' + fePath.replace(/\{param\}/g, '[^/]+') + '$';
    const regex = new RegExp(regexStr);

    let found = false;
    for (const beApi of backendApis) {
        const beMethod = beApi.split(' ')[0];
        const bePath = beApi.split(' ')[1];
        if (beMethod === method) {
            // Check if bePath matches fePath pattern
            const beRegexStr = '^' + bePath.replace(/\{param\}/g, '[^/]+') + '$';
            const beRegex = new RegExp(beRegexStr);
            if (beRegex.test(fePath) || regex.test(bePath) || bePath === fePath) {
                found = true;
                break;
            }
        }
    }

    if (!found) {
        console.log(`[${method}] ${fePath}`);
        missingCount++;
    }
}
if (missingCount === 0) {
    console.log('All frontend API endpoints seem to have a matching backend endpoint.');
} else {
    console.log(`Total missing: ${missingCount}`);
}

// 4. Find Unimplemented/Empty backend endpoints (throw NotImplementedException or return null implicitly)
console.log('\n--- UNIMPLEMENTED BACKEND ENDPOINTS ---');
let unimplCount = 0;
function scanUnimplementedBackend(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanUnimplementedBackend(fullPath);
        } else if (file.endsWith('Controller.java')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('UnsupportedOperationException') || content.includes('NotImplementedException') || content.includes('return null; // TODO') || content.includes('TODO: Implement')) {
                console.log('Found unimplemented methods in: ' + file);
                unimplCount++;
            }
        }
    }
}
scanUnimplementedBackend(backendDir);
if (unimplCount === 0) {
    console.log('No explicitly unimplemented backend controllers found.');
}
