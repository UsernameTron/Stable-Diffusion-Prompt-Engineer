/**
 * Stable Diffusion Prompt Engineering Assistant
 * A comprehensive tool for optimizing prompts across SD models
 */

// Optional dependency for web interface
let express;
try {
    express = require('express');
} catch (error) {
    // Express will only be required when using --web flag
}

// Core data structures
const modelData = {
    'sdxl': {
        name: 'Stable Diffusion XL',
        promptFormat: 'Subject, description, style, medium, artists, quality boosters',
        tokenLimit: 75,
        weightingTechnique: '(word:1.2) or (((word))):1.3 emphasis',
        recommendedParameters: {
            cfgRange: { min: 6, max: 12, default: 7.5 },
            samplers: ['DPM++ 2M Karras', 'DDIM', 'Euler a'],
            steps: { min: 25, max: 60, default: 35 },
            strength: { min: 0.3, max: 0.9, default: 0.7 }
        },
        negativePromptBase: 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry'
    },
    'sd15': {
        name: 'Stable Diffusion 1.5',
        promptFormat: 'Subject, description, style, artists, quality boosters',
        tokenLimit: 75,
        weightingTechnique: 'word:1.2 or (word) or ((word)) emphasis',
        recommendedParameters: {
            cfgRange: { min: 7, max: 14, default: 11 },
            samplers: ['Euler a', 'DPM++ 2M Karras', 'DDIM'],
            steps: { min: 20, max: 50, default: 30 },
            strength: { min: 0.4, max: 0.8, default: 0.7 }
        },
        negativePromptBase: 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name'
    },
    'sd21': {
        name: 'Stable Diffusion 2.1',
        promptFormat: 'Subject, detailed description, style, artists, quality boosters',
        tokenLimit: 75,
        weightingTechnique: '(word:1.1) emphasis, sensitive to over-emphasis',
        recommendedParameters: {
            cfgRange: { min: 5, max: 12, default: 9 },
            samplers: ['DPM++ SDE Karras', 'Euler a', 'DDIM'],
            steps: { min: 25, max: 60, default: 40 },
            strength: { min: 0.3, max: 0.8, default: 0.6 }
        },
        negativePromptBase: 'nsfw, lowres, text, error, cropped, worst quality, low quality, jpeg artifacts, signature, watermark, username, blurry, artist name, deformed feet, deformed hands, deformed face'
    }
};

// Content type templates
const contentTemplates = {
    portrait: {
        basePrompt: 'portrait of [subject], [description], [clothing], [expression], [lighting], [background], [style], [medium], [artist], [quality]',
        keyElements: {
            subject: ['a man', 'a woman', 'a person', 'a child'],
            description: ['detailed facial features', 'expressive eyes', 'sharp jawline'],
            clothing: ['formal attire', 'casual outfit', 'period costume'],
            expression: ['smiling warmly', 'serious expression', 'contemplative gaze'],
            lighting: ['soft rim lighting', 'dramatic side lighting', 'golden hour glow'],
            background: ['simple studio backdrop', 'blurred nature setting', 'gradient background'],
            style: ['realistic', 'stylized', 'cinematic', 'editorial'],
            medium: ['digital painting', 'photograph', 'oil painting', 'watercolor'],
            artist: ['by Greg Rutkowski', 'by Annie Leibovitz', 'by Studio Ghibli'],
            quality: ['highly detailed', 'masterpiece', '8k resolution', 'award-winning']
        },
        negativeAdditions: 'deformed iris, deformed pupils, mutated hands, poorly drawn face, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation'
    },
    landscape: {
        basePrompt: '[environment] landscape, [time of day], [weather], [lighting], [perspective], [style], [medium], [artist], [quality]',
        keyElements: {
            environment: ['mountain', 'coastal', 'forest', 'desert', 'urban', 'countryside'],
            timeOfDay: ['sunrise', 'midday', 'sunset', 'night', 'golden hour', 'blue hour'],
            weather: ['clear sky', 'stormy', 'foggy', 'rainy', 'snowy', 'cloudy'],
            lighting: ['dramatic lighting', 'soft diffused light', 'god rays', 'volumetric lighting'],
            perspective: ['aerial view', 'wide angle', 'panoramic', 'bird\'s eye view'],
            style: ['photorealistic', 'impressionistic', 'fantasy', 'science fiction'],
            medium: ['digital art', 'matte painting', 'photograph', 'oil painting'],
            artist: ['by Albert Bierstadt', 'by Thomas Kinkade', 'by Studio Ghibli'],
            quality: ['highly detailed', 'masterpiece', 'vivid colors', 'artstation HQ']
        },
        negativeAdditions: 'deformed, signature, watermark, text, bad perspective, distorted horizon line, blurry, grainy, oversaturated, jpeg artifacts'
    },
    concept: {
        basePrompt: '[subject] concept art, [description], [style elements], [lighting], [perspective], [style], [medium], [artist], [quality]',
        keyElements: {
            subject: ['character', 'creature', 'vehicle', 'environment', 'building', 'weapon'],
            description: ['futuristic', 'ancient', 'technological', 'organic', 'mechanical'],
            styleElements: ['intricate details', 'ornate decorations', 'minimalist design', 'weathered and worn'],
            lighting: ['dramatic lighting', 'ambient occlusion', 'studio lighting', 'cinematic lighting'],
            perspective: ['front view', 'three-quarter view', 'side view', 'action pose'],
            style: ['science fiction', 'fantasy', 'steampunk', 'cyberpunk', 'medieval'],
            medium: ['digital art', 'industrial design', 'sketch', 'detailed rendering'],
            artist: ['by Feng Zhu', 'by Craig Mullins', 'by Weta Workshop'],
            quality: ['highly detailed', 'professional', 'trending on artstation', 'concept art']
        },
        negativeAdditions: 'amateur, poorly drawn, simple, generic, flat, blurry, grainy, text, watermark, signature, sketch, draft'
    },
    anime: {
        basePrompt: '[character type], [outfit], [pose], [expression], [background], [style], [artist], [quality]',
        keyElements: {
            characterType: ['anime girl', 'anime boy', 'anime character', 'manga character'],
            outfit: ['school uniform', 'casual clothes', 'fantasy outfit', 'elaborate costume'],
            pose: ['dynamic pose', 'standing pose', 'action pose', 'sitting pose'],
            expression: ['smiling', 'serious expression', 'surprised', 'emotional'],
            background: ['detailed background', 'simple background', 'gradient background'],
            style: ['anime style', 'manga style', 'cel shaded', 'vibrant colors'],
            artist: ['by Studio Ghibli', 'by Makoto Shinkai', 'by Kyoto Animation'],
            quality: ['highly detailed', 'best quality', 'sharp', 'clean lines']
        },
        negativeAdditions: 'deformed, poorly drawn, bad anatomy, wrong proportions, extra limbs, floating limbs, disconnected limbs, distorted face, bad hands, missing fingers, extra digit, fewer digits, blurry, mutation, mutated'
    }
};

// Modifier library
const modifierLibrary = {
    photography: {
        shotTypes: ['close-up', 'medium shot', 'wide shot', 'extreme close-up', 'aerial shot', 'dutch angle', 'over-the-shoulder'],
        styles: ['documentary', 'portrait', 'fashion', 'street photography', 'landscape', 'architectural', 'macro', 'wildlife'],
        lighting: ['natural light', 'golden hour', 'studio lighting', 'low key', 'high key', 'backlit', 'rim light', 'split lighting', 'butterfly lighting'],
        equipment: ['35mm', '85mm lens', 'wide-angle lens', 'DSLR', 'medium format', 'shot on film', 'Leica', 'Canon', 'Sony', 'Hasselblad']
    },
    artMediums: {
        painting: ['oil painting', 'watercolor', 'acrylic', 'gouache', 'tempera', 'fresco', 'impasto technique'],
        digital: ['digital painting', 'digital art', 'digital illustration', 'concept art', 'matte painting', '3D render', 'octane render', 'blender', 'zbrush']
    },
    artists: {
        painters: [
            { name: 'Greg Rutkowski', style: 'fantasy, detailed, vibrant colors, dramatic lighting' },
            { name: 'Thomas Kinkade', style: 'romantic, idyllic, warm colors, glowing light, cottages' },
            { name: 'Alphonse Mucha', style: 'art nouveau, ornate, decorative, flowing lines, pastel colors' }
        ],
        digital: [
            { name: 'Artgerm', style: 'polished, beautiful faces, detailed, soft lighting, fantasy' },
            { name: 'Wlop', style: 'ethereal, glowing, dramatic, fantastical, detailed' },
            { name: 'Craig Mullins', style: 'painterly, atmospheric, concept art, loose brushwork' }
        ],
        anime: [
            { name: 'Makoto Shinkai', style: 'detailed backgrounds, dreamy, atmospheric, soft lighting' },
            { name: 'Studio Ghibli', style: 'whimsical, detailed, natural settings, expressive characters' },
            { name: 'Satoshi Kon', style: 'psychological, detailed environments, realistic shading' }
        ]
    },
    enhancers: {
        technical: ['highly detailed', 'sharp focus', '8k resolution', 'hyperrealistic', 'photorealistic', 'intricate', 'cinematic', 'illustration', 'concept art'],
        emotional: ['serene', 'melancholic', 'dramatic', 'ethereal', 'mysterious', 'whimsical', 'foreboding', 'uplifting', 'nostalgic'],
        aesthetic: ['vibrant colors', 'muted colors', 'monochromatic', 'high contrast', 'low contrast', 'pastel colors', 'complementary colors']
    }
};

// ControlNet integration guides
const controlNetGuides = {
    openPose: {
        description: 'Controls figure posing and positioning',
        usage: 'Upload a pose image with dot connections for accurate body positioning',
        promptTips: 'Focus on describing clothing, style, and environment rather than posing',
        strengthRecommendation: '0.6-0.8 for strong guidance without limiting creativity',
        bestModels: 'Works well with all SD models, especially effective with SDXL'
    },
    cannyEdge: {
        description: 'Preserves edges and structural elements (Kenny Mode)',
        usage: 'Upload an image or use preprocessor to generate edge detection',
        promptTips: 'Describe textures, colors, and style since structure is handled by the control image',
        strengthRecommendation: '0.4-0.7 depending on how strictly you want to follow edges',
        bestModels: 'SD 1.5 often provides more precise edge following'
    },
    depth: {
        description: 'Controls spatial relationships and perspective',
        usage: 'Upload a depth map or use preprocessor to generate depth information',
        promptTips: 'Focus on describing content, style, and mood rather than spatial arrangements',
        strengthRecommendation: '0.5-0.7 for balanced guidance',
        bestModels: 'SDXL has improved depth understanding with this controller'
    },
    lineArt: {
        description: 'Follows line art drawings for precise transformations',
        usage: 'Upload clean line art or sketches',
        promptTips: 'Describe colors, textures, and style since lines are controlled by the input',
        strengthRecommendation: '0.7-0.9 for close adherence to line art',
        bestModels: 'SD 1.5 with anime-specific fine-tunes works exceptionally well'
    },
    ipAdapter: {
        description: 'Uses reference images to influence style and content',
        usage: 'Upload reference images that have the visual style you want to emulate',
        promptTips: 'Use prompts to guide content while letting IP Adapter control stylistic elements',
        strengthRecommendation: '0.6-0.8 for balanced influence',
        bestModels: 'SDXL provides the most flexibility with IP Adapter integration'
    }
};

// Result analysis patterns
const resultAnalysisPatterns = {
    qualityIssues: {
        lowDetail: {
            symptoms: 'Blurry textures, lack of fine details, flat appearance',
            causes: 'Too few steps, low CFG scale, incompatible model for the prompt',
            solutions: 'Increase step count, increase CFG scale, add quality enhancers to prompt'
        },
        artifacts: {
            symptoms: 'Unnatural patterns, grid-like structures, color banding',
            causes: 'Model limitations, prompt contradictions, too high CFG scale',
            solutions: 'Change sampler, moderate CFG scale, add negative prompts targeting artifacts'
        },
        composition: {
            symptoms: 'Awkward framing, unbalanced elements, confused focal point',
            causes: 'Vague prompt, conflicting descriptors, lack of composition guidance',
            solutions: 'Use specific composition terminology, utilize ControlNet for layout guidance'
        }
    },
    subjectIssues: {
        portraits: {
            anatomy: {
                symptoms: 'Distorted features, extra fingers, unnatural proportions',
                causes: 'Model limitations, lack of specific negative prompts',
                solutions: 'Use detailed negative prompts targeting anatomy issues, weight anatomy terms higher'
            },
            consistency: {
                symptoms: 'Mismatched attributes, changing features between images',
                causes: 'Seed variation, insufficient subject description',
                solutions: 'Use seed locking, more detailed subject description, textual inversion or LoRA for character consistency'
            }
        },
        landscapes: {
            perspective: {
                symptoms: 'Warped horizon, impossible angles, multiple vanishing points',
                causes: 'Conflicting perspective terms, lack of specific guidance',
                solutions: 'Use single clear perspective term, employ ControlNet depth or canny for structure'
            },
            elements: {
                symptoms: 'Unrealistic scale relationships, floating objects, impossible lighting',
                causes: 'Contradictory terms, insufficient environmental context',
                solutions: 'Specify time of day explicitly, use reference terms like "realistic scale", strong CFG values'
            }
        }
    },
    commonProblems: {
        textRendering: {
            symptoms: 'Garbled text, unreadable letters, text-like patterns',
            causes: 'Model limitations with text generation',
            solutions: 'Strong negative prompts for text, avoid requesting text in prompt, use img2img for adding text later'
        },
        promptIgnoring: {
            symptoms: 'Key elements missing from result, style inconsistent with prompt',
            causes: 'Token competition, model biases, improper weighting',
            solutions: 'Apply emphasis to important terms, reduce competing descriptors, break complex concepts into simpler terms'
        }
    }
};

// Helper functions
function weightWord(word, model, emphasis) {
    const defaultEmphasis = 1.1;
    const actualEmphasis = emphasis || defaultEmphasis;
    
    if (model === 'sdxl') {
        if (actualEmphasis >= 1.3) {
            return `(((${word})))`;
        } else if (actualEmphasis >= 1.2) {
            return `((${word}))`;
        } else {
            return `(${word})`;
        }
    } else if (model === 'sd15') {
        if (actualEmphasis >= 1.3) {
            return `((${word}))`;
        } else if (actualEmphasis >= 1.2) {
            return `(${word})`;
        } else {
            return `${word}:${actualEmphasis.toFixed(1)}`;
        }
    } else { // sd21
        return `(${word}:${actualEmphasis.toFixed(1)})`;
    }
}

function generatePrompt(model, contentType, options) {
    const modelInfo = modelData[model];
    const template = contentTemplates[contentType];
    
    if (!modelInfo || !template) {
        return { error: 'Invalid model or content type' };
    }
    
    let basePrompt = template.basePrompt;
    const elements = template.keyElements;
    
    // Replace placeholders with options or defaults
    for (const [key, values] of Object.entries(elements)) {
        const placeholder = `[${key}]`;
        let replacement = options[key] || values[0];
        
        // Apply weighting to important elements
        if (['subject', 'style', 'artist'].includes(key)) {
            replacement = weightWord(replacement, model, 1.2);
        }
        
        basePrompt = basePrompt.replace(placeholder, replacement);
    }
    
    // Check token count (rough approximation, actual tokenization would be more complex)
    const approxTokens = basePrompt.split(' ').length;
    
    return {
        prompt: basePrompt,
        approxTokens,
        tokenLimit: modelInfo.tokenLimit,
        model: modelInfo.name,
        recommendedParameters: modelInfo.recommendedParameters,
        weightingTechnique: modelInfo.weightingTechnique
    };
}

function generateNegativePrompt(model, contentType) {
    const modelInfo = modelData[model];
    const template = contentTemplates[contentType];
    
    if (!modelInfo || !template) {
        return { error: 'Invalid model or content type' };
    }
    
    return {
        negativePrompt: `${modelInfo.negativePromptBase}, ${template.negativeAdditions}`,
        model: modelInfo.name
    };
}

function analyzeResult(issueType, specificProblem) {
    let analysis;
    
    if (specificProblem) {
        // Specific issue analysis
        if (issueType === 'quality' && resultAnalysisPatterns.qualityIssues[specificProblem]) {
            analysis = resultAnalysisPatterns.qualityIssues[specificProblem];
        } else if (issueType === 'portrait' && resultAnalysisPatterns.subjectIssues.portraits[specificProblem]) {
            analysis = resultAnalysisPatterns.subjectIssues.portraits[specificProblem];
        } else if (issueType === 'landscape' && resultAnalysisPatterns.subjectIssues.landscapes[specificProblem]) {
            analysis = resultAnalysisPatterns.subjectIssues.landscapes[specificProblem];
        } else if (issueType === 'common' && resultAnalysisPatterns.commonProblems[specificProblem]) {
            analysis = resultAnalysisPatterns.commonProblems[specificProblem];
        } else {
            return { error: 'Invalid issue type or specific problem' };
        }
    } else {
        // General category suggestions
        if (issueType === 'quality') {
            analysis = {
                suggestions: [
                    'Increase step count for more detail',
                    'Adjust CFG scale (7-9 is balanced)',
                    'Add quality enhancers to prompt (highly detailed, masterpiece, etc.)',
                    'Use appropriate negative prompts for the model'
                ]
            };
        } else if (issueType === 'portrait') {
            analysis = {
                suggestions: [
                    'Use strong negative prompts for anatomical issues',
                    'Add facial feature descriptors for better definition',
                    'Specify lighting terms for better rendering',
                    'Consider LoRA for consistent character generation'
                ]
            };
        } else if (issueType === 'landscape') {
            analysis = {
                suggestions: [
                    'Specify perspective and time of day clearly',
                    'Use reference terms like "award-winning photography"',
                    'Specify weather and atmospheric conditions',
                    'Add depth-related terms for better spatial relationships'
                ]
            };
        } else {
            return { error: 'Invalid issue type' };
        }
    }
    
    return analysis;
}

function getControlNetRecommendation(technique) {
    const guide = controlNetGuides[technique];
    
    if (!guide) {
        return { 
            error: 'Invalid ControlNet technique',
            availableTechniques: Object.keys(controlNetGuides)
        };
    }
    
    return guide;
}

function getArtistStyleInfo(category, artistName) {
    const artists = modifierLibrary.artists[category];
    
    if (!artists) {
        return {
            error: 'Invalid artist category',
            availableCategories: Object.keys(modifierLibrary.artists)
        };
    }
    
    const artist = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
    
    if (!artist) {
        return {
            error: 'Artist not found',
            availableArtists: artists.map(a => a.name)
        };
    }
    
    return artist;
}

// Main assistant function
function promptAssistant(action, params) {
    switch (action) {
        case 'generatePrompt':
            return generatePrompt(params.model, params.contentType, params.options || {});
        
        case 'generateNegativePrompt':
            return generateNegativePrompt(params.model, params.contentType);
        
        case 'analyzeResult':
            return analyzeResult(params.issueType, params.specificProblem);
        
        case 'getControlNetGuide':
            return getControlNetRecommendation(params.technique);
        
        case 'getArtistInfo':
            return getArtistStyleInfo(params.category, params.artistName);
        
        case 'getModifierSuggestions':
            const category = params.category;
            const subCategory = params.subCategory;
            
            if (!modifierLibrary[category]) {
                return {
                    error: 'Invalid modifier category',
                    availableCategories: Object.keys(modifierLibrary)
                };
            }
            
            if (subCategory && !modifierLibrary[category][subCategory]) {
                return {
                    error: 'Invalid modifier sub-category',
                    availableSubCategories: Object.keys(modifierLibrary[category])
                };
            }
            
            return {
                modifiers: subCategory ? modifierLibrary[category][subCategory] : modifierLibrary[category]
            };
            
        case 'getModelInfo':
            const model = params.model;
            
            if (!modelData[model]) {
                return {
                    error: 'Invalid model',
                    availableModels: Object.keys(modelData)
                };
            }
            
            return modelData[model];
            
        default:
            return {
                error: 'Invalid action',
                availableActions: [
                    'generatePrompt',
                    'generateNegativePrompt',
                    'analyzeResult',
                    'getControlNetGuide',
                    'getArtistInfo',
                    'getModifierSuggestions',
                    'getModelInfo'
                ]
            };
    }
}

// Console interface
function runConsoleInterface() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    console.log('=== Stable Diffusion Prompt Engineering Assistant ===');
    console.log('Type "help" for available commands, "exit" to quit\n');
    
    const handleCommand = (input) => {
        if (input === 'exit') {
            rl.close();
            return;
        }
        
        if (input === 'help') {
            console.log('\nAvailable commands:');
            console.log('  prompt <model> <contentType> - Generate an optimized prompt');
            console.log('  negative <model> <contentType> - Generate a negative prompt');
            console.log('  analyze <issueType> [specificProblem] - Analyze output issues');
            console.log('  controlnet <technique> - Get ControlNet implementation guide');
            console.log('  artist <category> <artistName> - Get artist style information');
            console.log('  modifiers <category> [subCategory] - Get modifier suggestions');
            console.log('  modelinfo <model> - Get model-specific information');
            console.log('  exit - Exit the assistant\n');
            rl.prompt();
            return;
        }
        
        const parts = input.split(' ');
        const command = parts[0];
        
        try {
            let result;
            
            switch (command) {
                case 'prompt':
                    result = promptAssistant('generatePrompt', {
                        model: parts[1],
                        contentType: parts[2],
                        options: {}
                    });
                    break;
                    
                case 'negative':
                    result = promptAssistant('generateNegativePrompt', {
                        model: parts[1],
                        contentType: parts[2]
                    });
                    break;
                    
                case 'analyze':
                    result = promptAssistant('analyzeResult', {
                        issueType: parts[1],
                        specificProblem: parts[2]
                    });
                    break;
                    
                case 'controlnet':
                    result = promptAssistant('getControlNetGuide', {
                        technique: parts[1]
                    });
                    break;
                    
                case 'artist':
                    result = promptAssistant('getArtistInfo', {
                        category: parts[1],
                        artistName: parts.slice(2).join(' ')
                    });
                    break;
                    
                case 'modifiers':
                    result = promptAssistant('getModifierSuggestions', {
                        category: parts[1],
                        subCategory: parts[2]
                    });
                    break;
                    
                case 'modelinfo':
                    result = promptAssistant('getModelInfo', {
                        model: parts[1]
                    });
                    break;
                    
                default:
                    console.log('Unknown command. Type "help" for available commands.');
                    rl.prompt();
                    return;
            }
            
            console.log(JSON.stringify(result, null, 2));
        } catch (error) {
            console.error('Error:', error.message);
        }
        
        rl.prompt();
    };
    
    rl.on('line', handleCommand);
    rl.prompt();
}

// Web interface with Express.js
function setupExpressServer() {
    if (!express) {
        console.error('Error: Express.js is not installed. Run "npm install express" to use the web interface.');
        process.exit(1);
    }
    
    const app = express();
    const port = process.env.PORT || 3000;
    
    // Serve static files and parse JSON
    app.use(express.static('public'));
    app.use(express.json());
    
    // API endpoints
    app.post('/api/prompt', (req, res) => {
        const { model, contentType, options } = req.body;
        const result = promptAssistant('generatePrompt', { model, contentType, options });
        res.json(result);
    });
    
    app.post('/api/negative', (req, res) => {
        const { model, contentType } = req.body;
        const result = promptAssistant('generateNegativePrompt', { model, contentType });
        res.json(result);
    });
    
    app.post('/api/analyze', (req, res) => {
        const { issueType, specificProblem } = req.body;
        const result = promptAssistant('analyzeResult', { issueType, specificProblem });
        res.json(result);
    });
    
    app.post('/api/controlnet', (req, res) => {
        const { technique } = req.body;
        const result = promptAssistant('getControlNetGuide', { technique });
        res.json(result);
    });
    
    app.post('/api/artist', (req, res) => {
        const { category, artistName } = req.body;
        const result = promptAssistant('getArtistInfo', { category, artistName });
        res.json(result);
    });
    
    app.post('/api/modifiers', (req, res) => {
        const { category, subCategory } = req.body;
        const result = promptAssistant('getModifierSuggestions', { category, subCategory });
        res.json(result);
    });
    
    app.post('/api/modelinfo', (req, res) => {
        const { model } = req.body;
        const result = promptAssistant('getModelInfo', { model });
        res.json(result);
    });
    
    // Create HTML for the web interface
    app.get('/', (req, res) => {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Stable Diffusion Prompt Assistant</title>
            <style>
                :root {
                    --primary: #6366f1;
                    --primary-dark: #4338ca;
                    --secondary: #ec4899;
                    --dark: #1f2937;
                    --light: #f9fafb;
                    --gray: #9ca3af;
                    --success: #10b981;
                    --warning: #f59e0b;
                    --error: #ef4444;
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: var(--dark);
                    background-color: var(--light);
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                
                header {
                    margin-bottom: 2rem;
                    text-align: center;
                }
                
                h1 {
                    color: var(--primary-dark);
                    margin-bottom: 0.5rem;
                }
                
                .tabs {
                    display: flex;
                    border-bottom: 1px solid var(--gray);
                    margin-bottom: 2rem;
                }
                
                .tab {
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    border: none;
                    background: none;
                    font-size: 1rem;
                    font-weight: 500;
                    color: var(--dark);
                    border-bottom: 2px solid transparent;
                }
                
                .tab.active {
                    color: var(--primary);
                    border-bottom: 2px solid var(--primary);
                }
                
                .tab:hover:not(.active) {
                    color: var(--primary-dark);
                    border-bottom: 2px solid var(--gray);
                }
                
                .tab-content {
                    display: none;
                }
                
                .tab-content.active {
                    display: block;
                }
                
                .card {
                    background-color: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                
                .form-group {
                    margin-bottom: 1rem;
                }
                
                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }
                
                select, input, textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--gray);
                    border-radius: 0.25rem;
                    font-size: 1rem;
                    font-family: inherit;
                }
                
                select:focus, input:focus, textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                }
                
                button {
                    background-color: var(--primary);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 0.25rem;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                button:hover {
                    background-color: var(--primary-dark);
                }
                
                .result {
                    background-color: #f3f4f6;
                    padding: 1rem;
                    border-radius: 0.25rem;
                    margin-top: 1rem;
                    white-space: pre-wrap;
                    font-family: monospace;
                }
                
                .parameter-card {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                
                .parameter-item {
                    flex: 1;
                    min-width: 200px;
                    background-color: #f9fafb;
                    padding: 1rem;
                    border-radius: 0.25rem;
                    border-left: 4px solid var(--primary);
                }
                
                .parameter-item h3 {
                    margin-bottom: 0.5rem;
                    color: var(--primary-dark);
                }
                
                .controlnet-info {
                    margin-top: 1rem;
                }
                
                .controlnet-info h3 {
                    color: var(--primary-dark);
                    margin-bottom: 0.5rem;
                }
                
                .controlnet-info p {
                    margin-bottom: 0.5rem;
                }
                
                .copy-button {
                    background-color: var(--dark);
                    color: white;
                    font-size: 0.875rem;
                    padding: 0.25rem 0.5rem;
                    float: right;
                    margin-top: -0.5rem;
                }
                
                .copy-button:hover {
                    background-color: var(--primary);
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1rem;
                }
                
                .grid-item {
                    background-color: white;
                    border-radius: 0.25rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    padding: 1rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .grid-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .text-small {
                    font-size: 0.875rem;
                    color: var(--gray);
                }
                
                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    background-color: var(--primary);
                    color: white;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    margin-right: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                
                .badge-secondary {
                    background-color: var(--secondary);
                }
                
                .badge-success {
                    background-color: var(--success);
                }
                
                .badge-warning {
                    background-color: var(--warning);
                }
                
                @media (max-width: 768px) {
                    .tabs {
                        flex-wrap: wrap;
                    }
                    
                    .tab {
                        flex: 1 0 auto;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>Stable Diffusion Prompt Engineering Assistant</h1>
                    <p>Create optimized prompts for different SD models and use cases</p>
                </header>
                
                <div class="tabs">
                    <button class="tab active" data-tab="prompt-generator">Prompt Generator</button>
                    <button class="tab" data-tab="negative-prompts">Negative Prompts</button>
                    <button class="tab" data-tab="parameter-optimization">Parameters</button>
                    <button class="tab" data-tab="controlnet-guide">ControlNet</button>
                    <button class="tab" data-tab="result-analysis">Result Analysis</button>
                    <button class="tab" data-tab="modifier-library">Modifier Library</button>
                </div>
                
                <!-- Prompt Generator Tab -->
                <div id="prompt-generator" class="tab-content active">
                    <div class="card">
                        <h2>Model-Specific Prompt Generation</h2>
                        <div class="form-group">
                            <label for="model-select">Select Model</label>
                            <select id="model-select">
                                <option value="sdxl">Stable Diffusion XL</option>
                                <option value="sd15">Stable Diffusion 1.5</option>
                                <option value="sd21">Stable Diffusion 2.1</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="content-type">Content Type</label>
                            <select id="content-type">
                                <option value="portrait">Portrait/Character</option>
                                <option value="landscape">Landscape/Environment</option>
                                <option value="concept">Concept Art</option>
                                <option value="anime">Anime/Stylized</option>
                            </select>
                        </div>
                        
                        <div id="custom-options" class="form-group">
                            <!-- Dynamically populated based on content type -->
                        </div>
                        
                        <button id="generate-prompt-btn">Generate Prompt</button>
                        
                        <div id="prompt-result" class="result" style="display: none;">
                            <button class="copy-button" id="copy-prompt-btn">Copy</button>
                            <div id="prompt-text"></div>
                        </div>
                    </div>
                    
                    <div id="parameter-guidance" class="card" style="display: none;">
                        <h2>Recommended Parameters</h2>
                        <div id="parameter-recommendations"></div>
                    </div>
                </div>
                
                <!-- Negative Prompts Tab -->
                <div id="negative-prompts" class="tab-content">
                    <div class="card">
                        <h2>Model-Specific Negative Prompts</h2>
                        <div class="form-group">
                            <label for="neg-model-select">Select Model</label>
                            <select id="neg-model-select">
                                <option value="sdxl">Stable Diffusion XL</option>
                                <option value="sd15">Stable Diffusion 1.5</option>
                                <option value="sd21">Stable Diffusion 2.1</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="neg-content-type">Content Type</label>
                            <select id="neg-content-type">
                                <option value="portrait">Portrait/Character</option>
                                <option value="landscape">Landscape/Environment</option>
                                <option value="concept">Concept Art</option>
                                <option value="anime">Anime/Stylized</option>
                            </select>
                        </div>
                        
                        <button id="generate-negative-btn">Generate Negative Prompt</button>
                        
                        <div id="negative-result" class="result" style="display: none;">
                            <button class="copy-button" id="copy-negative-btn">Copy</button>
                            <div id="negative-text"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Parameter Optimization Tab -->
                <div id="parameter-optimization" class="tab-content">
                    <div class="card">
                        <h2>Parameter Optimization</h2>
                        <div class="form-group">
                            <label for="param-model-select">Select Model</label>
                            <select id="param-model-select">
                                <option value="sdxl">Stable Diffusion XL</option>
                                <option value="sd15">Stable Diffusion 1.5</option>
                                <option value="sd21">Stable Diffusion 2.1</option>
                            </select>
                        </div>
                        
                        <button id="get-parameters-btn">Get Parameter Recommendations</button>
                        
                        <div id="params-result" style="display: none;">
                            <div class="parameter-card">
                                <div class="parameter-item">
                                    <h3>CFG Scale</h3>
                                    <div id="cfg-guidance"></div>
                                </div>
                                
                                <div class="parameter-item">
                                    <h3>Samplers</h3>
                                    <div id="sampler-guidance"></div>
                                </div>
                                
                                <div class="parameter-item">
                                    <h3>Steps</h3>
                                    <div id="steps-guidance"></div>
                                </div>
                                
                                <div class="parameter-item">
                                    <h3>Strength (img2img)</h3>
                                    <div id="strength-guidance"></div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="seed-input">Seed Management</label>
                                <input type="number" id="seed-input" placeholder="Enter seed (or leave blank for random)">
                                <p class="text-small">Use the same seed to maintain consistency across generations with similar prompts</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- ControlNet Guide Tab -->
                <div id="controlnet-guide" class="tab-content">
                    <div class="card">
                        <h2>ControlNet Integration Guide</h2>
                        <div class="form-group">
                            <label for="controlnet-select">Select Technique</label>
                            <select id="controlnet-select">
                                <option value="openPose">Open Pose</option>
                                <option value="cannyEdge">Canny Edge (Kenny Mode)</option>
                                <option value="depth">Depth</option>
                                <option value="lineArt">Line Art</option>
                                <option value="ipAdapter">IP Adapter</option>
                            </select>
                        </div>
                        
                        <button id="get-controlnet-btn">Get Implementation Guide</button>
                        
                        <div id="controlnet-result" class="controlnet-info" style="display: none;"></div>
                    </div>
                </div>
                
                <!-- Result Analysis Tab -->
                <div id="result-analysis" class="tab-content">
                    <div class="card">
                        <h2>Result Analysis Tools</h2>
                        <div class="form-group">
                            <label for="issue-type">Issue Category</label>
                            <select id="issue-type">
                                <option value="quality">Quality Issues</option>
                                <option value="portrait">Portrait/Character Issues</option>
                                <option value="landscape">Landscape/Environment Issues</option>
                                <option value="common">Common Problems</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="specific-problem">Specific Issue (Optional)</label>
                            <select id="specific-problem">
                                <option value="">General advice</option>
                                <!-- Options will be populated based on issue type -->
                            </select>
                        </div>
                        
                        <button id="analyze-btn">Get Analysis & Solutions</button>
                        
                        <div id="analysis-result" style="display: none;" class="result"></div>
                    </div>
                </div>
                
                <!-- Modifier Library Tab -->
                <div id="modifier-library" class="tab-content">
                    <div class="card">
                        <h2>Comprehensive Modifier Library</h2>
                        <div class="form-group">
                            <label for="modifier-category">Category</label>
                            <select id="modifier-category">
                                <option value="photography">Photography</option>
                                <option value="artMediums">Art Mediums</option>
                                <option value="artists">Artists</option>
                                <option value="enhancers">Quality Enhancers</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="subcategory-container" style="display: none;">
                            <label for="modifier-subcategory">Sub-Category</label>
                            <select id="modifier-subcategory">
                                <!-- Options will be populated based on category -->
                            </select>
                        </div>
                        
                        <button id="get-modifiers-btn">Get Modifiers</button>
                        
                        <div id="modifiers-result" style="display: none;" class="grid"></div>
                    </div>
                </div>
            </div>
            
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    // Tab switching
                    const tabs = document.querySelectorAll('.tab');
                    const tabContents = document.querySelectorAll('.tab-content');
                    
                    tabs.forEach(tab => {
                        tab.addEventListener('click', () => {
                            tabs.forEach(t => t.classList.remove('active'));
                            tabContents.forEach(content => content.classList.remove('active'));
                            
                            tab.classList.add('active');
                            const tabId = tab.getAttribute('data-tab');
                            document.getElementById(tabId).classList.add('active');
                        });
                    });
                    
                    // Prompt Generator
                    const modelSelect = document.getElementById('model-select');
                    const contentTypeSelect = document.getElementById('content-type');
                    const customOptions = document.getElementById('custom-options');
                    const generatePromptBtn = document.getElementById('generate-prompt-btn');
                    const promptResult = document.getElementById('prompt-result');
                    const promptText = document.getElementById('prompt-text');
                    const copyPromptBtn = document.getElementById('copy-prompt-btn');
                    const parameterGuidance = document.getElementById('parameter-guidance');
                    const parameterRecommendations = document.getElementById('parameter-recommendations');
                    
                    // Populate custom options based on content type
                    contentTypeSelect.addEventListener('change', () => {
                        updateCustomOptions();
                    });
                    
                    function updateCustomOptions() {
                        const contentType = contentTypeSelect.value;
                        
                        fetch('/api/prompt', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                model: modelSelect.value,
                                contentType: contentType,
                                options: {}
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            
                            // Get template elements from the prompt structure
                            const prompt = data.prompt;
                            const placeholderPattern = /\\[([^\\]]+)\\]/g;
                            const matches = [...prompt.matchAll(placeholderPattern)];
                            
                            let html = '';
                            const elements = matches.map(match => match[1]);
                            
                            elements.forEach(element => {
                                html += \`
                                    <div class="form-group">
                                        <label for="\${element}-input">\${element.charAt(0).toUpperCase() + element.slice(1)}</label>
                                        <input type="text" id="\${element}-input" placeholder="Enter \${element}">
                                    </div>
                                \`;
                            });
                            
                            customOptions.innerHTML = html;
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while fetching options');
                        });
                    }
                    
                    // Initialize custom options
                    updateCustomOptions();
                    
                    // Generate prompt
                    generatePromptBtn.addEventListener('click', () => {
                        const model = modelSelect.value;
                        const contentType = contentTypeSelect.value;
                        const options = {};
                        
                        // Gather custom options
                        const inputs = customOptions.querySelectorAll('input');
                        inputs.forEach(input => {
                            const key = input.id.replace('-input', '');
                            if (input.value) {
                                options[key] = input.value;
                            }
                        });
                        
                        fetch('/api/prompt', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ model, contentType, options })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            
                            promptText.textContent = data.prompt;
                            promptResult.style.display = 'block';
                            
                            // Show parameter recommendations
                            const params = data.recommendedParameters;
                            let paramsHtml = '<div class="parameter-card">';
                            
                            paramsHtml += \`
                                <div class="parameter-item">
                                    <h3>CFG Scale</h3>
                                    <p>Range: \${params.cfgRange.min} - \${params.cfgRange.max}</p>
                                    <p>Default: \${params.cfgRange.default}</p>
                                </div>
                                
                                <div class="parameter-item">
                                    <h3>Recommended Samplers</h3>
                                    <ul>
                                        \${params.samplers.map(sampler => \`<li>\${sampler}</li>\`).join('')}
                                    </ul>
                                </div>
                                
                                <div class="parameter-item">
                                    <h3>Steps</h3>
                                    <p>Range: \${params.steps.min} - \${params.steps.max}</p>
                                    <p>Default: \${params.steps.default}</p>
                                </div>
                            \`;
                            
                            paramsHtml += '</div>';
                            parameterRecommendations.innerHTML = paramsHtml;
                            parameterGuidance.style.display = 'block';
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while generating prompt');
                        });
                    });
                    
                    // Copy prompt
                    copyPromptBtn.addEventListener('click', () => {
                        const text = promptText.textContent;
                        navigator.clipboard.writeText(text)
                            .then(() => {
                                const originalText = copyPromptBtn.textContent;
                                copyPromptBtn.textContent = 'Copied!';
                                setTimeout(() => {
                                    copyPromptBtn.textContent = originalText;
                                }, 1500);
                            })
                            .catch(err => {
                                console.error('Error copying text:', err);
                            });
                    });
                    
                    // Negative Prompts
                    const negModelSelect = document.getElementById('neg-model-select');
                    const negContentType = document.getElementById('neg-content-type');
                    const generateNegativeBtn = document.getElementById('generate-negative-btn');
                    const negativeResult = document.getElementById('negative-result');
                    const negativeText = document.getElementById('negative-text');
                    const copyNegativeBtn = document.getElementById('copy-negative-btn');
                    
                    generateNegativeBtn.addEventListener('click', () => {
                        const model = negModelSelect.value;
                        const contentType = negContentType.value;
                        
                        fetch('/api/negative', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ model, contentType })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            
                            negativeText.textContent = data.negativePrompt;
                            negativeResult.style.display = 'block';
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while generating negative prompt');
                        });
                    });
                    
                    copyNegativeBtn.addEventListener('click', () => {
                        const text = negativeText.textContent;
                        navigator.clipboard.writeText(text)
                            .then(() => {
                                const originalText = copyNegativeBtn.textContent;
                                copyNegativeBtn.textContent = 'Copied!';
                                setTimeout(() => {
                                    copyNegativeBtn.textContent = originalText;
                                }, 1500);
                            })
                            .catch(err => {
                                console.error('Error copying text:', err);
                            });
                    });
                    
                    // Parameter Optimization
                    const paramModelSelect = document.getElementById('param-model-select');
                    const getParametersBtn = document.getElementById('get-parameters-btn');
                    const paramsResult = document.getElementById('params-result');
                    const cfgGuidance = document.getElementById('cfg-guidance');
                    const samplerGuidance = document.getElementById('sampler-guidance');
                    const stepsGuidance = document.getElementById('steps-guidance');
                    const strengthGuidance = document.getElementById('strength-guidance');
                    
                    getParametersBtn.addEventListener('click', () => {
                        const model = paramModelSelect.value;
                        
                        fetch('/api/modelinfo', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ model })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            
                            const params = data.recommendedParameters;
                            
                            cfgGuidance.innerHTML = \`
                                <p><strong>Range:</strong> \${params.cfgRange.min} - \${params.cfgRange.max}</p>
                                <p><strong>Default:</strong> \${params.cfgRange.default}</p>
                                <p class="text-small">
                                    Low: More creative freedom (5-7)<br>
                                    Mid: Balanced (7-9)<br>
                                    High: Precise prompt adherence (9-12)
                                </p>
                            \`;
                            
                            samplerGuidance.innerHTML = \`
                                <p><strong>Recommended (in order):</strong></p>
                                <ol>
                                    \${params.samplers.map(sampler => \`<li>\${sampler}</li>\`).join('')}
                                </ol>
                                <p class="text-small">
                                    DDIM: Faster results<br>
                                    Euler a: Balanced<br>
                                    DPM++: Higher quality
                                </p>
                            \`;
                            
                            stepsGuidance.innerHTML = \`
                                <p><strong>Range:</strong> \${params.steps.min} - \${params.steps.max}</p>
                                <p><strong>Default:</strong> \${params.steps.default}</p>
                                <p class="text-small">
                                    Low: Quick drafts (20-25)<br>
                                    Mid: Standard quality (30-40)<br>
                                    High: Maximum detail (40-60)
                                </p>
                            \`;
                            
                            strengthGuidance.innerHTML = \`
                                <p><strong>Range:</strong> \${params.strength.min} - \${params.strength.max}</p>
                                <p><strong>Default:</strong> \${params.strength.default}</p>
                                <p class="text-small">
                                    Low: Subtle changes (0.2-0.4)<br>
                                    Mid: Balanced (0.5-0.7)<br>
                                    High: Major changes (0.7-0.9)
                                </p>
                            \`;
                            
                            paramsResult.style.display = 'block';
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while getting parameters');
                        });
                    });
                    
                    // ControlNet Guide
                    const controlnetSelect = document.getElementById('controlnet-select');
                    const getControlnetBtn = document.getElementById('get-controlnet-btn');
                    const controlnetResult = document.getElementById('controlnet-result');
                    
                    getControlnetBtn.addEventListener('click', () => {
                        const technique = controlnetSelect.value;
                        
                        fetch('/api/controlnet', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ technique })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            
                            let html = \`
                                <h3>\${controlnetSelect.options[controlnetSelect.selectedIndex].text}</h3>
                                <p><strong>Description:</strong> \${data.description}</p>
                                <p><strong>Usage:</strong> \${data.usage}</p>
                                <p><strong>Prompt Tips:</strong> \${data.promptTips}</p>
                                <p><strong>Strength:</strong> \${data.strengthRecommendation}</p>
                                <p><strong>Best Models:</strong> \${data.bestModels}</p>
                            \`;
                            
                            controlnetResult.innerHTML = html;
                            controlnetResult.style.display = 'block';
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while getting ControlNet guide');
                        });
                    });
                    
                    // Result Analysis
                    const issueTypeSelect = document.getElementById('issue-type');
                    const specificProblemSelect = document.getElementById('specific-problem');
                    const analyzeBtn = document.getElementById('analyze-btn');
                    const analysisResult = document.getElementById('analysis-result');
                    
                    // Update specific problem options based on issue type
                    issueTypeSelect.addEventListener('change', () => {
                        const issueType = issueTypeSelect.value;
                        specificProblemSelect.innerHTML = '<option value="">General advice</option>';
                        
                        let options = [];
                        
                        switch (issueType) {
                            case 'quality':
                                options = ['lowDetail', 'artifacts', 'composition'];
                                break;
                            case 'portrait':
                                options = ['anatomy', 'consistency'];
                                break;
                            case 'landscape':
                                options = ['perspective', 'elements'];
                                break;
                            case 'common':
                                options = ['textRendering', 'promptIgnoring'];
                                break;
                        }
                        
                        options.forEach(option => {
                            const optionElement = document.createElement('option');
                            optionElement.value = option;
                            optionElement.textContent = option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            specificProblemSelect.appendChild(optionElement);
                        });
                    });
                    
                    analyzeBtn.addEventListener('click', () => {
                        const issueType = issueTypeSelect.value;
                        const specificProblem = specificProblemSelect.value;
                        
                        fetch('/api/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ issueType, specificProblem })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            
                            let html = '';
                            
                            if (data.symptoms) {
                                html += \`<p><strong>Symptoms:</strong> \${data.symptoms}</p>\`;
                                html += \`<p><strong>Causes:</strong> \${data.causes}</p>\`;
                                html += \`<p><strong>Solutions:</strong> \${data.solutions}</p>\`;
                            } else if (data.suggestions) {
                                html += '<p><strong>Suggestions:</strong></p>';
                                html += '<ul>';
                                data.suggestions.forEach(suggestion => {
                                    html += \`<li>\${suggestion}</li>\`;
                                });
                                html += '</ul>';
                            }
                            
                            analysisResult.innerHTML = html;
                            analysisResult.style.display = 'block';
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while analyzing');
                        });
                    });
                    
                    // Modifier Library
                    const modifierCategory = document.getElementById('modifier-category');
                    const subcategoryContainer = document.getElementById('subcategory-container');
                    const modifierSubcategory = document.getElementById('modifier-subcategory');
                    const getModifiersBtn = document.getElementById('get-modifiers-btn');
                    const modifiersResult = document.getElementById('modifiers-result');
                    
                    // Update subcategory options based on category
                    modifierCategory.addEventListener('change', () => {
                        const category = modifierCategory.value;
                        
                        fetch('/api/modifiers', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ category })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            
                            const subcategories = Object.keys(data.modifiers);
                            
                            if (subcategories.length > 0) {
                                modifierSubcategory.innerHTML = '';
                                
                                subcategories.forEach(subcategory => {
                                    const option = document.createElement('option');
                                    option.value = subcategory;
                                    option.textContent = subcategory.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    modifierSubcategory.appendChild(option);
                                });
                                
                                subcategoryContainer.style.display = 'block';
                            } else {
                                subcategoryContainer.style.display = 'none';
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while fetching subcategories');
                        });
                    });
                    
                    getModifiersBtn.addEventListener('click', () => {
                        const category = modifierCategory.value;
                        const subCategory = subcategoryContainer.style.display === 'none' ? null : modifierSubcategory.value;
                        
                        fetch('/api/modifiers', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ category, subCategory })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            
                            let modifiers;
                            
                            if (subCategory) {
                                modifiers = data.modifiers[subCategory];
                            } else {
                                modifiers = data.modifiers;
                            }
                            
                            let html = '';
                            
                            if (Array.isArray(modifiers)) {
                                // Simple array of strings
                                modifiers.forEach(modifier => {
                                    if (typeof modifier === 'object' && modifier.name) {
                                        // Artist objects with name and style
                                        html += \`
                                            <div class="grid-item">
                                                <h3>\${modifier.name}</h3>
                                                <p>\${modifier.style}</p>
                                                <button class="copy-button" data-text="\${modifier.name}">Copy</button>
                                            </div>
                                        \`;
                                    } else {
                                        // Simple string modifier
                                        html += \`
                                            <div class="grid-item">
                                                <p>\${modifier}</p>
                                                <button class="copy-button" data-text="\${modifier}">Copy</button>
                                            </div>
                                        \`;
                                    }
                                });
                            } else {
                                // Object with subcategories
                                for (const [key, value] of Object.entries(modifiers)) {
                                    html += \`<h3>\${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>\`;
                                    html += '<div class="grid">';
                                    
                                    if (Array.isArray(value)) {
                                        value.forEach(modifier => {
                                            if (typeof modifier === 'object' && modifier.name) {
                                                // Artist objects with name and style
                                                html += \`
                                                    <div class="grid-item">
                                                        <h3>\${modifier.name}</h3>
                                                        <p>\${modifier.style}</p>
                                                        <button class="copy-button" data-text="\${modifier.name}">Copy</button>
                                                    </div>
                                                \`;
                                            } else {
                                                // Simple string modifier
                                                html += \`
                                                    <div class="grid-item">
                                                        <p>\${modifier}</p>
                                                        <button class="copy-button" data-text="\${modifier}">Copy</button>
                                                    </div>
                                                \`;
                                            }
                                        });
                                    }
                                    
                                    html += '</div>';
                                }
                            }
                            
                            modifiersResult.innerHTML = html;
                            modifiersResult.style.display = 'block';
                            
                            // Add event listeners to copy buttons
                            const copyButtons = modifiersResult.querySelectorAll('.copy-button');
                            copyButtons.forEach(button => {
                                button.addEventListener('click', () => {
                                    const text = button.getAttribute('data-text');
                                    navigator.clipboard.writeText(text)
                                        .then(() => {
                                            const originalText = button.textContent;
                                            button.textContent = 'Copied!';
                                            setTimeout(() => {
                                                button.textContent = originalText;
                                            }, 1500);
                                        })
                                        .catch(err => {
                                            console.error('Error copying text:', err);
                                        });
                                });
                            });
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while fetching modifiers');
                        });
                    });
                    
                    // Initialize the first category's subcategories
                    modifierCategory.dispatchEvent(new Event('change'));
                });
            </script>
        </body>
        </html>
        `;
        
        res.send(html);
    });
    
    // Start server
    app.listen(port, () => {
        console.log(`Stable Diffusion Prompt Assistant running at http://localhost:${port}`);
    });
}

// Main entry point
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--web')) {
        try {
            setupExpressServer();
        } catch (error) {
            console.error('Error starting web interface:', error.message);
            console.error('Run "npm install express" to use the web interface.');
            process.exit(1);
        }
    } else {
        runConsoleInterface();
    }
}

module.exports = {
    promptAssistant,
    generatePrompt,
    generateNegativePrompt,
    analyzeResult,
    getControlNetRecommendation,
    getArtistStyleInfo,
    weightWord
};