/**
 * Enhanced Stable Diffusion Prompt Generator
 * Features specialized prompt generation for OpenArt AI models and Kling AI motion prompts
 */

// Motion prompt patterns for Kling AI
const MOTION_PATTERNS = {
    simple: {
        patterns: [
            "moving", "walking", "running", "flying", "flowing", "spinning", "rotating", "turning",
            "swinging", "dancing", "jumping", "falling", "rising", "zooming", "panning", "tracking",
            "orbiting", "circling", "bouncing", "shaking", "trembling", "vibrating", "oscillating",
            "wiggling", "waving", "flickering", "pulsing", "throbbing", "glowing", "flashing"
        ],
        enhancers: [
            "slowly", "quickly", "gracefully", "dramatically", "smoothly", "subtly", "vigorously",
            "gently", "rapidly", "gradually", "suddenly", "calmly", "dynamically", "continuously"
        ]
    },
    complex: {
        camera: [
            "camera panning left to right", "camera zooming in", "camera zooming out", 
            "camera tracking forward", "camera tracking backward", "camera following subject",
            "camera orbiting around", "camera dolly zoom", "camera tilting up", "camera tilting down",
            "aerial view", "Dutch angle", "crane shot", "static camera"
        ],
        transitions: [
            "dissolving into", "fading to", "transforming into", "morphing into", 
            "transitioning to", "evolving into", "changing to", "becoming"
        ],
        directions: {
            linear: ["upward", "downward", "leftward", "rightward", "forward", "backward"],
            circular: ["clockwise", "counterclockwise", "spiral", "around", "in circles"]
        }
    },
    environments: {
        wind: ["windy", "breezy", "gusty", "stormy", "gentle breeze", "strong winds"],
        water: ["waves", "ripples", "splashing", "flowing water", "rain falling", "raindrops"],
        particles: ["floating dust", "embers", "sparks", "snow falling", "leaves falling", "petals floating"]
    }
};

// OpenArt AI model-specific enhancers
const MODEL_ENHANCERS = {
    juggernautxl: {
        portraitEnhancers: [
            "photorealistic portrait", "lifelike skin texture", "detailed facial features", 
            "subtle skin details", "natural lighting", "expressive portrait", "realistic eyes"
        ],
        recommendedCFG: "4-6",
        recommendedSampler: "DPM++ 2M SDE",
        recommendedSteps: "30-40"
    },
    fluxdev: {
        textEnhancers: [
            "clear text", "legible typography", "readable labels", "integrated text",
            "detailed typography", "accurate text positioning"
        ],
        recommendedCFG: "7-8",
        recommendedSampler: "DPM++ 2M Karras",
        recommendedSteps: "28-35"
    },
    juggernautfluxpro: {
        textureEnhancers: [
            "natural skin texture", "detailed material surfaces", "photorealistic texture",
            "fabric detail", "surface reflection", "material definition", "organic texture"
        ],
        recommendedCFG: "4-7",
        recommendedSampler: "DPM++ 2M Karras",
        recommendedSteps: "30-40"
    },
    fluxpro: {
        professionalEnhancers: [
            "professional quality", "commercial grade", "detailed composition",
            "balanced lighting", "polished finish", "premium look", "studio quality"
        ],
        recommendedCFG: "5-9",
        recommendedSampler: "DPM++ 2M Karras",
        recommendedSteps: "25-35"
    },
    sdxlfilm: {
        filmEnhancers: [
            "film photography style", "authentic film grain", "light grain", "medium grain", 
            "heavy grain", "analog film look", "film color grading", "35mm film", "medium format film"
        ],
        recommendedCFG: "7-9",
        recommendedSampler: "DPM++ 2M Karras",
        recommendedSteps: "30-40"
    }
};

/**
 * Generate a motion prompt for Kling AI
 * @param {string} basePrompt - The base image prompt
 * @param {string} motionType - The type of motion to apply
 * @param {string} intensity - Motion intensity level
 * @return {string} The formatted motion prompt
 */
function generateKlingMotionPrompt(basePrompt, motionType = 'natural', intensity = 'medium') {
    // Clean and prepare the base prompt
    const cleanedPrompt = basePrompt.trim().replace(/\.$/, '');
    
    // Define motion patterns based on intensity
    let motionIntensity = {
        low: ["slowly", "gently", "subtly", "slightly", "minimally"],
        medium: ["smoothly", "steadily", "moderately", "gradually"],
        high: ["quickly", "rapidly", "dramatically", "vigorously", "intensely"]
    };
    
    // Select intensity modifier
    const intensityMod = motionIntensity[intensity][Math.floor(Math.random() * motionIntensity[intensity].length)];
    
    // Generate motion prompt based on type
    let motionSegment = "";
    
    switch(motionType) {
        case 'camera':
            // Camera motion
            const cameraMotions = MOTION_PATTERNS.complex.camera;
            motionSegment = `${intensityMod} ${cameraMotions[Math.floor(Math.random() * cameraMotions.length)]}`;
            break;
            
        case 'wind':
            // Wind effects
            const windEffects = MOTION_PATTERNS.environments.wind;
            motionSegment = `with ${windEffects[Math.floor(Math.random() * windEffects.length)]} effect, ${intensityMod} moving`;
            break;
            
        case 'water':
            // Water motion
            const waterEffects = MOTION_PATTERNS.environments.water;
            motionSegment = `with ${waterEffects[Math.floor(Math.random() * waterEffects.length)]}, ${intensityMod} moving`;
            break;
            
        case 'particles':
            // Particle effects
            const particleEffects = MOTION_PATTERNS.environments.particles;
            motionSegment = `with ${particleEffects[Math.floor(Math.random() * particleEffects.length)]}, ${intensityMod} moving`;
            break;
            
        case 'natural':
        default:
            // Natural motion - detect and enhance motion terms already in the prompt
            const motionTerms = MOTION_PATTERNS.simple.patterns;
            const containsMotion = motionTerms.some(term => cleanedPrompt.includes(term));
            
            if (containsMotion) {
                // Enhance existing motion
                motionSegment = `${intensityMod} in motion`;
            } else {
                // Add basic motion
                const simpleMotion = motionTerms[Math.floor(Math.random() * motionTerms.length)];
                motionSegment = `${intensityMod} ${simpleMotion}`;
            }
    }
    
    // Format the final motion prompt
    return `${cleanedPrompt}, ${motionSegment}`;
}

/**
 * Generate an optimized prompt for a specific OpenArt AI model
 * @param {string} subject - The main subject
 * @param {string} details - Additional details
 * @param {string} style - Art style
 * @param {string} model - Selected OpenArt model
 * @return {object} The generated prompt and recommendations
 */
function generateOpenArtPrompt(subject, details, style, model) {
    // Clean and prepare inputs
    const cleanedSubject = subject.trim();
    const cleanedDetails = details.trim();
    const cleanedStyle = style.trim();
    
    // Base prompt structure
    let promptParts = [cleanedSubject];
    
    // Add details if provided
    if (cleanedDetails) {
        promptParts.push(cleanedDetails);
    }
    
    // Add style if provided
    if (cleanedStyle) {
        promptParts.push(cleanedStyle);
    }
    
    // Add model-specific enhancers
    if (MODEL_ENHANCERS[model]) {
        const enhancerCategory = 
            model === 'juggernautxl' ? 'portraitEnhancers' :
            model === 'fluxdev' ? 'textEnhancers' :
            model === 'juggernautfluxpro' ? 'textureEnhancers' :
            model === 'fluxpro' ? 'professionalEnhancers' :
            model === 'sdxlfilm' ? 'filmEnhancers' : 'portraitEnhancers';
        
        // Add 1-2 model-specific enhancers
        const enhancers = MODEL_ENHANCERS[model][enhancerCategory];
        const selectedEnhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
        promptParts.push(selectedEnhancer);
        
        // Add quality enhancers for most models
        if (model !== 'sdxlfilm') {  // Film style doesn't need these
            promptParts.push("high quality, detailed");
        }
    }
    
    // Format the final prompt
    const finalPrompt = promptParts.join(", ");
    
    // Build recommendations
    const recommendations = {};
    if (MODEL_ENHANCERS[model]) {
        recommendations.cfg = MODEL_ENHANCERS[model].recommendedCFG;
        recommendations.sampler = MODEL_ENHANCERS[model].recommendedSampler;
        recommendations.steps = MODEL_ENHANCERS[model].recommendedSteps;
    }
    
    // Return both prompt and recommendations
    return {
        prompt: finalPrompt,
        recommendations: recommendations
    };
}

/**
 * Generate a natural language prompt based on input description
 * @param {string} description - Natural language input
 * @param {string} style - Art style preference
 * @return {string} Structured prompt
 */
function generateNaturalLanguagePrompt(description, style = "") {
    // Clean input
    const cleanedDescription = description.trim();
    
    // Detect potential content type
    const contentTypes = [
        { type: "portrait", keywords: ["person", "face", "portrait", "man", "woman", "girl", "boy", "character"] },
        { type: "landscape", keywords: ["landscape", "scenery", "mountains", "beach", "forest", "nature", "city", "urban"] },
        { type: "concept", keywords: ["concept", "design", "idea", "logo", "product", "abstract"] },
        { type: "animal", keywords: ["animal", "pet", "dog", "cat", "bird", "wildlife"] }
    ];
    
    // Determine likely content type
    let detectedType = "general";
    let highestMatchCount = 0;
    
    contentTypes.forEach(content => {
        const matchCount = content.keywords.filter(keyword => 
            cleanedDescription.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        
        if (matchCount > highestMatchCount) {
            highestMatchCount = matchCount;
            detectedType = content.type;
        }
    });
    
    // Quality enhancers based on content type
    const qualityEnhancers = {
        portrait: "sharp focus, highly detailed, photorealistic, 4K, high quality",
        landscape: "atmospheric, scenic, professional photography, 8K, high detail",
        concept: "conceptual, detailed, professional rendering, high quality",
        animal: "detailed fur/feathers, professional photography, sharp focus, high quality",
        general: "high quality, detailed, sharp focus, 4K"
    };
    
    // Build prompt with structure
    let structuredPrompt = cleanedDescription;
    
    // Add style if provided
    if (style && style !== "none") {
        structuredPrompt += `, ${style}`;
    }
    
    // Add quality enhancers
    structuredPrompt += `, ${qualityEnhancers[detectedType]}`;
    
    return structuredPrompt;
}

// Export the functions for use in the main application
module.exports = {
    generateKlingMotionPrompt,
    generateOpenArtPrompt,
    generateNaturalLanguagePrompt
};