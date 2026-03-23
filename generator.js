let generatedSite = null;
let previewWindow = null;

// Generate complete production website
function generateWebsite() {
    const name = document.getElementById('siteName').value.trim();
    const desc = document.getElementById('siteDesc').value.trim();
    const color = document.getElementById('siteColor').value;
    
    if (!name || !desc) {
        alert('👋 Please enter website name & description');
        return;
    }

    // Generate FULL production website
    generatedSite = {
        name, desc, color,
        domain: name.toLowerCase().replace(/[^a-z0-9.-]/g, ''),
        ownerEmail: `owner@${name.toLowerCase().replace(/[^a-z0-9.-]/g, '')}`,
        files: generateAllFiles(name, desc, color)
    };

    // Update UI
    document.getElementById('generatedTitle').textContent = name;
    document.getElementById('generatedDesc').textContent = desc;
    document.getElementById('outputSection').classList.remove('hidden');
    
    updateFileList();
    setTimeout(() => previewLive(), 800);
    
    // Scroll to output
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

// Generate ALL production files
function generateAllFiles(name, desc, color) {
    const primaryColor = color || '#ff6b6b';
    const domain = name.toLowerCase().replace(/[^a-z0-9.-]/g, '');
    
    return {
        'index.html': generateIndexHTML(name, desc, primaryColor, domain),
        'style.css': generateCSS(primaryColor),
        'script.js': generateMainJS(domain),
        'auth.js': generateAuthJS(domain),
        'generator.js': generateFeatureJS(desc),
        'owner.html': generateOwnerPanel(name, domain),
        'manifest.json': generateManifest(name),
        '_redirects': '/*    /index.html   200'
    };
}

// Generate complete index.html
function generateIndexHTML(name, desc, color, domain) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${name} - \${desc}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
</head>
<body style="--primary-color: \${color}">
    <!-- Owner Unlimited Access Panel -->
    <div id="ownerPanel" style="display:none;position:fixed;top:20px;right:20px;z-index:9999">
        <a href="owner.html" style="background:gold;color:black;padding:12px 24px;border-radius:50px;font-weight:bold;text-decoration:none;box-shadow:0 8px 25px rgba(255,215,0,0.5);animation:glow 2s infinite alternate">
            <i class="fas fa-crown"></i> Owner Panel - FREE FOREVER
        </a>
    </div>

    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">\${name}</div>
            <div class="nav-menu">
                <a href="#home">Home</a>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#generator">Generator</a>
            </div>
            <div class="auth-section">
                <div id="userPanel" style="display:none">
                    <span id="userName"></span>
                    <button onclick="logout()">Logout</button>
                </div>
                <button id="loginBtn" onclick="showLogin()">Login</button>
            </div>
        </div>
    </nav>

    <section id="home" class="hero">
        <div class="hero-content">
            <h1>\${desc}</h1>
            <p>AI-Powered Professional Automation Platform</p>
            <button class="cta-btn" onclick="scrollToGenerator()">Start Free Trial <i class="fas fa-rocket"></i></button>
        </div>
    </section>

    <section id="generator" class="generator-section">
        <div class="container">
            <h2>AI \${desc.split(' ')[0]} Generator</h2>
            <textarea id="inputArea" placeholder="Enter your input/script/content here...&#10;&#10;Example:&#10;• Describe what you want&#10;• AI generates complete result&#10;• Professional quality output"></textarea>
            <div class="action-buttons">
                <button id="generateBtn" class="generate-btn" onclick="generateContent()">
                    <span>Generate \${desc}</span>
                    <div class="spinner" style="display:none"></div>
                </button>
                <button class="quick-btn" onclick="loadDemo()">Demo Input</button>
            </div>
            <div id="outputArea" class="output-area" style="display:none">
                <h3> Generated Result</h3>
                <div id="resultContent"></div>
                <button class="download-btn" onclick="downloadResult()">Download Result</button>
            </div>
        </div>
    </section>

    <section id="pricing" class="pricing-section">
        <div class="container">
            <h2>Simple Transparent Pricing</h2>
            <div class="pricing-grid">
                <div class="price-card">
                    <h3>Starter</h3>
                    <div class="price">\$${Math.floor(Math.random()*10+9)}<span>/mo</span></div>
                    <ul>
                        <li>10 Generations</li>
                        <li>Basic Quality</li>
                        <li>Email Support</li>
                    </ul>
                    <button class="buy-btn" onclick="buyPlan('starter')">Get Started</button>
                </div>
                <div class="price-card popular">
