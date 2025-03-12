/**
 * OpenArt AI and Kling AI Prompt Generation
 * Handles specialized prompt generation for OpenArt AI models and Kling AI motion prompts
 */

document.addEventListener('DOMContentLoaded', () => {
    // Negative prompt templates for OpenArt models
    const negativePrompts = {
        juggernautxl: "deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime, mutated hands and fingers, deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation",
        fluxdev: "blurry, distorted text, illegible text, poorly drawn, warped, unrealistic proportions, stretched image, deformed, disfigured, bad typography, spelling errors, text cutoff, bad font, pixelated text, watermark, signature",
        juggernautfluxpro: "plastic skin, smooth skin, airbrushed skin, blurry, watermark, text, ugly, deformed, disfigured, bad anatomy, poorly drawn face, mutation, mutated, extra limb, missing limb, floating limbs, disconnected limbs, out of frame, extra fingers, mutated hands",
        fluxpro: "poor quality, low resolution, bad composition, distorted, disfigured, poorly rendered, bad craftsmanship, poor lighting, flat lighting, pixelated, watermark, text, artificial, oversaturated, cheap-looking",
        sdxlfilm: "digital, perfect skin, sharp, crisp, perfect, flawless, smooth, plastic skin, airbrushed, pristine, hdr, hdr lighting, hdr render, perfect lighting, artificial lighting, studio lighting"
    };
    // OpenArt AI model enhancers
    const modelEnhancers = {
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
    
    // Motion patterns for Kling AI
    const motionPatterns = {
        simple: ["moving", "walking", "running", "flying", "flowing", "spinning", "rotating", "turning",
            "swinging", "dancing", "jumping", "falling", "rising", "zooming", "panning", "tracking"],
        camera: ["camera panning left to right", "camera zooming in", "camera zooming out", 
            "camera tracking forward", "camera tracking backward", "camera following subject"],
        environmental: ["windy", "breezy", "waves", "ripples", "floating particles", "flowing water"]
    };
    
    // Motion intensity modifiers
    const intensityModifiers = {
        low: ["slowly", "gently", "subtly", "slightly"],
        medium: ["smoothly", "steadily", "moderately"],
        high: ["quickly", "rapidly", "dramatically", "vigorously"]
    };
    
    // Kling AI specific negative prompts
    const klingNegativePrompt = "static, still image, no movement, frozen, stationary, motionless, fixed, immobile, still frame, bad quality, blurry, distorted, deformed, ugly, duplicate frames, jittery, error, defect, glitch, pixelated, low resolution, poor quality";
    
    /**
     * Generate a prompt optimized for OpenArt AI models
     */
    function generateOpenArtPrompt(subject, details, style, model) {
        // Clean inputs
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
        if (modelEnhancers[model]) {
            // Determine which enhancer category to use
            const enhancerCategory = 
                model === 'juggernautxl' ? 'portraitEnhancers' :
                model === 'fluxdev' ? 'textEnhancers' :
                model === 'juggernautfluxpro' ? 'textureEnhancers' :
                model === 'fluxpro' ? 'professionalEnhancers' :
                model === 'sdxlfilm' ? 'filmEnhancers' : 'portraitEnhancers';
            
            // Add 1-2 model-specific enhancers
            const enhancers = modelEnhancers[model][enhancerCategory];
            const selectedEnhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
            promptParts.push(selectedEnhancer);
            
            // Add quality enhancers for most models
            if (model !== 'sdxlfilm') {  // Film style doesn't need these
                promptParts.push("high quality, detailed");
            }
        }
        
        // Format the final prompt
        const finalPrompt = promptParts.join(", ");
        
        // Get model-specific negative prompt
        const negativePrompt = negativePrompts[model] || negativePrompts.juggernautxl;
        
        // Return prompt, negative prompt, and recommendations
        return {
            prompt: finalPrompt,
            negativePrompt: negativePrompt,
            recommendations: {
                cfg: modelEnhancers[model].recommendedCFG,
                sampler: modelEnhancers[model].recommendedSampler,
                steps: modelEnhancers[model].recommendedSteps
            }
        };
    }
    
    /**
     * Generate a motion prompt for Kling AI
     */
    function generateKlingMotionPrompt(basePrompt, motionType, intensity) {
        // Clean input
        const cleanedPrompt = basePrompt.trim().replace(/\.$/, '');
        
        // Extract subject from the basePrompt
        let subject = "subject";
        const possibleSubjects = cleanedPrompt.match(/^(a |an |the )?([a-z]+)/i);
        if (possibleSubjects && possibleSubjects[2]) {
            subject = possibleSubjects[2].toLowerCase();
        }
        
        // Parse the prompt for action verbs
        const actionVerbs = [
            "looking", "walking", "running", "moving", "sitting", "standing", 
            "talking", "smiling", "frowning", "gesturing", "pointing", "typing",
            "working", "eating", "drinking", "sleeping", "dancing", "jumping",
            "speaking", "laughing", "crying", "reading", "writing", "drawing"
        ];
        
        // Find existing actions in the prompt
        let existingActions = [];
        actionVerbs.forEach(verb => {
            if (cleanedPrompt.toLowerCase().includes(verb)) {
                existingActions.push(verb);
            }
        });
        
        // Select intensity modifier
        const intensityMods = intensityModifiers[intensity] || intensityModifiers.medium;
        const intensityMod = intensityMods[Math.floor(Math.random() * intensityMods.length)];
        
        // Build motion description based on type
        let motionDescription = "";
        
        switch(motionType) {
            case 'camera':
                // Camera motion
                const cameraDirections = ["from left to right", "from right to left", "forward", "backward", "in a circular motion"];
                const cameraDirection = cameraDirections[Math.floor(Math.random() * cameraDirections.length)];
                const cameraActions = ["panning", "tracking", "dollying", "zooming", "tilting"];
                const cameraAction = cameraActions[Math.floor(Math.random() * cameraActions.length)];
                
                motionDescription = `camera ${intensityMod} ${cameraAction} ${cameraDirection}, maintaining focus on ${subject}`;
                break;
                
            case 'environmental':
                // Environmental motion
                const envElements = ["wind", "air", "light", "shadows", "background"];
                const envElement = envElements[Math.floor(Math.random() * envElements.length)];
                
                const envEffects = ["flowing", "moving", "swirling", "shifting", "changing"];
                const envEffect = envEffects[Math.floor(Math.random() * envEffects.length)];
                
                motionDescription = `with ${envElement} ${intensityMod} ${envEffect} around ${subject}`;
                break;
                
            case 'simple':
            default:
                // Enhanced simple motion based on existing actions
                let motionVerb = "";
                
                if (existingActions.length > 0) {
                    // Enhance existing action
                    const action = existingActions[0];
                    const enhancements = [
                        `continuing to ${action}`,
                        `${intensityMod} ${action}`,
                        `${action} with increasing intensity`,
                        `dynamically ${action}`
                    ];
                    motionVerb = enhancements[Math.floor(Math.random() * enhancements.length)];
                } else {
                    // No detected action, use generic motion
                    const genericMotions = [
                        "moving",
                        "gesturing",
                        "shifting position",
                        "changing expression",
                        "turning slightly"
                    ];
                    motionVerb = `${intensityMod} ${genericMotions[Math.floor(Math.random() * genericMotions.length)]}`;
                }
                
                // Add motion context
                const contexts = [
                    "while maintaining eye contact",
                    "as the scene unfolds",
                    "with natural movement",
                    "in a fluid motion",
                    "with lifelike animation"
                ];
                const context = contexts[Math.floor(Math.random() * contexts.length)];
                
                motionDescription = `${motionVerb}, ${context}`;
                break;
        }
        
        // Build complete motion prompt
        return `${cleanedPrompt}, ${motionDescription}`;
    }
    
    // Event listener for OpenArt prompt generation
    document.getElementById('generate-openart-prompt')?.addEventListener('click', () => {
        const subject = document.getElementById('openart-subject').value;
        const details = document.getElementById('openart-details').value;
        const style = document.getElementById('openart-style').value;
        
        // Get selected model
        const modelButton = document.querySelector('#openart-generator .model-selector .active');
        const model = modelButton.getAttribute('data-model');
        
        // Basic validation
        if (!subject) {
            alert('Please enter a subject');
            return;
        }
        
        // Generate the prompt
        const result = generateOpenArtPrompt(subject, details, style, model);
        
        // Display the prompt
        document.getElementById('openart-generated-prompt').textContent = result.prompt;
        
        // Display the negative prompt
        document.getElementById('openart-negative-prompt').textContent = result.negativePrompt;
        
        // Display recommendations
        const recList = document.getElementById('openart-recommendations');
        recList.innerHTML = `
            <li><strong>CFG Scale:</strong> ${result.recommendations.cfg}</li>
            <li><strong>Sampler:</strong> ${result.recommendations.sampler}</li>
            <li><strong>Steps:</strong> ${result.recommendations.steps}</li>
        `;
        
        // Show the result
        document.getElementById('openart-result').style.display = 'block';
    });
    
    // Event listener for copy OpenArt prompt
    document.getElementById('copy-openart-prompt')?.addEventListener('click', () => {
        const prompt = document.getElementById('openart-generated-prompt').textContent;
        navigator.clipboard.writeText(prompt)
            .then(() => {
                const button = document.getElementById('copy-openart-prompt');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy to clipboard');
            });
    });
    
    // Event listener for copy OpenArt negative prompt
    document.getElementById('copy-openart-negative')?.addEventListener('click', () => {
        const negativePrompt = document.getElementById('openart-negative-prompt').textContent;
        navigator.clipboard.writeText(negativePrompt)
            .then(() => {
                const button = document.getElementById('copy-openart-negative');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy to clipboard');
            });
    });
    
    // Event listener for Kling motion prompt generation
    document.getElementById('generate-motion-prompt')?.addEventListener('click', () => {
        const basePrompt = document.getElementById('base-prompt').value;
        const motionType = document.getElementById('motion-type').value;
        const intensity = document.getElementById('motion-intensity').value;
        
        // Basic validation
        if (!basePrompt) {
            alert('Please enter a base prompt');
            return;
        }
        
        // Generate the motion prompt
        const motionPrompt = generateKlingMotionPrompt(basePrompt, motionType, intensity);
        
        // Display the prompt
        document.getElementById('motion-generated-prompt').textContent = motionPrompt;
        
        // Display the negative prompt
        document.getElementById('motion-negative-prompt').textContent = klingNegativePrompt;
        
        // Show the result
        document.getElementById('motion-result').style.display = 'block';
    });
    
    // Event listener for copy motion prompt
    document.getElementById('copy-motion-prompt')?.addEventListener('click', () => {
        const prompt = document.getElementById('motion-generated-prompt').textContent;
        navigator.clipboard.writeText(prompt)
            .then(() => {
                const button = document.getElementById('copy-motion-prompt');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy to clipboard');
            });
    });
    
    // Event listener for copy motion negative prompt
    document.getElementById('copy-motion-negative')?.addEventListener('click', () => {
        const negativePrompt = document.getElementById('motion-negative-prompt').textContent;
        navigator.clipboard.writeText(negativePrompt)
            .then(() => {
                const button = document.getElementById('copy-motion-negative');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy to clipboard');
            });
    });
});