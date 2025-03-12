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
        basePrompt: '[subject], [description], [clothing], [expression], [lighting], [background], [style], [medium], [artist], [quality]',
        keyElements: {
            subject: ['a man', 'a woman', 'a person', 'a child', 'a knight', 'a cyborg'],
            description: ['detailed facial features', 'expressive eyes', 'sharp jawline', 'freckles', 'metallic skin'],
            clothing: ['formal attire', 'casual outfit', 'period costume', 'medieval armor', 'futuristic suit'],
            expression: ['smiling warmly', 'serious expression', 'contemplative gaze', 'determined look'],
            lighting: ['soft rim lighting', 'dramatic side lighting', 'golden hour glow', 'cinematic lighting', 'sunset lighting'],
            background: ['simple studio backdrop', 'blurred nature setting', 'gradient background', 'battlefield', 'futuristic setting'],
            style: ['realistic', 'stylized', 'cinematic', 'editorial', 'hyper-realistic', 'futuristic'],
            medium: ['digital painting', 'photograph', 'oil painting', 'watercolor', 'professional photograph', 'digital art'],
            artist: ['by Greg Rutkowski', 'by Annie Leibovitz', 'by Studio Ghibli', 'by concept artists'],
            quality: ['highly detailed', 'masterpiece', '8k resolution', 'award-winning', 'ultra-detailed', 'high fidelity', 'sharp focus']
        },
        negativeAdditions: 'deformed iris, deformed pupils, mutated hands, poorly drawn face, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation'
    },
    landscape: {
        basePrompt: '[environment] landscape, [time of day], [weather], [lighting], [perspective], [style], [medium], [artist], [quality]',
        keyElements: {
            environment: ['mountain', 'coastal', 'forest', 'desert', 'urban', 'countryside', 'dreamy forest', 'serene lake'],
            timeOfDay: ['sunrise', 'midday', 'sunset', 'night', 'golden hour', 'blue hour', 'dawn'],
            weather: ['clear sky', 'stormy', 'foggy', 'rainy', 'snowy', 'cloudy', 'misty'],
            lighting: ['dramatic lighting', 'soft diffused light', 'god rays', 'volumetric lighting', 'natural lighting', 'atmospheric', 'soft natural lighting'],
            perspective: ['aerial view', 'wide angle', 'panoramic', 'bird\'s eye view', 'wide shot'],
            style: ['photorealistic', 'impressionistic', 'fantasy', 'science fiction', 'surreal'],
            medium: ['digital art', 'matte painting', 'photograph', 'oil painting', 'impressionistic painting'],
            artist: ['by Albert Bierstadt', 'by Thomas Kinkade', 'by Studio Ghibli', 'by concept artists'],
            quality: ['highly detailed', 'masterpiece', 'vivid colors', 'artstation HQ', 'ultra-detailed', 'high fidelity', 'rich colors']
        },
        negativeAdditions: 'deformed, signature, watermark, text, bad perspective, distorted horizon line, blurry, grainy, oversaturated, jpeg artifacts'
    },
    concept: {
        basePrompt: '[subject] concept art, [description], [style elements], [lighting], [perspective], [style], [medium], [artist], [quality]',
        keyElements: {
            subject: ['character', 'creature', 'vehicle', 'environment', 'building', 'weapon', 'robot', 'sports car', 'abstract piece'],
            description: ['futuristic', 'ancient', 'technological', 'organic', 'mechanical', 'intricate gears', 'swirling colors', 'dynamic motion'],
            styleElements: ['intricate details', 'ornate decorations', 'minimalist design', 'weathered and worn', 'technical drawing', 'vibrant'],
            lighting: ['dramatic lighting', 'ambient occlusion', 'studio lighting', 'cinematic lighting', 'natural lighting'],
            perspective: ['front view', 'three-quarter view', 'side view', 'action pose', 'racetrack setting'],
            style: ['science fiction', 'fantasy', 'steampunk', 'cyberpunk', 'medieval', 'cinematic style'],
            medium: ['digital art', 'industrial design', 'sketch', 'detailed rendering', 'technical drawing', 'hyper-realistic rendering'],
            artist: ['by Feng Zhu', 'by Craig Mullins', 'by Weta Workshop', 'by concept artists'],
            quality: ['highly detailed', 'professional', 'trending on artstation', 'concept art', 'ultra-detailed', 'cinematic quality']
        },
        negativeAdditions: 'amateur, poorly drawn, simple, generic, flat, blurry, grainy, text, watermark, signature, sketch, draft'
    },
    urban: {
        basePrompt: '[environment] urban scene, [time of day], [weather], [lighting], [features], [style], [medium], [artist], [quality]',
        keyElements: {
            environment: ['cityscape', 'alley', 'street', 'downtown', 'metropolis', 'cyberpunk city'],
            timeOfDay: ['day', 'night', 'dusk', 'dawn', 'midnight'],
            weather: ['clear', 'rainy', 'foggy', 'snowy', 'stormy'],
            lighting: ['neon lights', 'street lamps', 'cinematic lighting', 'dramatic lighting', 'ambient lighting'],
            features: ['skyscrapers', 'flying cars', 'futuristic buildings', 'neon signs', 'bustling crowd', 'street vendors'],
            style: ['futuristic', 'cyberpunk', 'realistic', 'stylized', 'dystopian', 'utopian'],
            medium: ['digital art', 'matte painting', 'photograph', 'concept art', 'cinematic shot'],
            artist: ['by Feng Zhu', 'by Craig Mullins', 'by Weta Workshop', 'by concept artists'],
            quality: ['highly detailed', 'professional', 'trending on artstation', 'ultra-detailed', 'high fidelity']
        },
        negativeAdditions: 'deformed, signature, watermark, text, bad perspective, distorted buildings, blurry, grainy, oversaturated, jpeg artifacts'
    },
    anime: {
        basePrompt: '[character type], [outfit], [pose], [expression], [background], [style], [artist], [quality]',
        keyElements: {
            characterType: ['anime girl', 'anime boy', 'anime character', 'manga character'],
            outfit: ['school uniform', 'casual clothes', 'fantasy outfit', 'elaborate costume', 'futuristic outfit'],
            pose: ['dynamic pose', 'standing pose', 'action pose', 'sitting pose'],
            expression: ['smiling', 'serious expression', 'surprised', 'emotional', 'exaggerated features'],
            background: ['detailed background', 'simple background', 'gradient background', 'futuristic setting'],
            style: ['anime style', 'manga style', 'cel shaded', 'vibrant colors'],
            artist: ['by Studio Ghibli', 'by Makoto Shinkai', 'by Kyoto Animation'],
            quality: ['highly detailed', 'best quality', 'sharp', 'clean lines']
        },
        negativeAdditions: 'deformed, poorly drawn, bad anatomy, wrong proportions, extra limbs, floating limbs, disconnected limbs, distorted face, bad hands, missing fingers, extra digit, fewer digits, blurry, mutation, mutated'
    },
    fantasy: {
        basePrompt: '[subject] [scene], [environment], [lighting], [style], [medium], [artist], [quality]',
        keyElements: {
            subject: ['fairy tale castle', 'mythical creature', 'wizard', 'dragon', 'fairy', 'elven city'],
            scene: ['magical scene', 'enchanted forest', 'mystical landscape', 'fantasy world'],
            environment: ['lush greenery', 'magical forest', 'crystal caves', 'floating islands', 'mystical mountains'],
            lighting: ['magical glow', 'ethereal light', 'soft luminescence', 'dramatic lighting', 'golden rays'],
            style: ['whimsical', 'fantastical', 'dreamy', 'magical', 'fantasy'],
            medium: ['digital illustration', 'concept art', 'oil painting', 'watercolor', 'vibrant illustration'],
            artist: ['by Greg Rutkowski', 'by Studio Ghibli', 'by Thomas Kinkade', 'by fantasy concept artists'],
            quality: ['highly detailed', 'vibrant colors', 'masterpiece', 'ultra-detailed', 'cinematic lighting']
        },
        negativeAdditions: 'deformed, signature, watermark, text, bad anatomy, poorly drawn, amateurish, blurry, grainy, low resolution'
    },
    surreal: {
        basePrompt: '[subject] surreal scene, [elements], [environment], [style], [medium], [artist], [quality]',
        keyElements: {
            subject: ['dreamlike', 'surreal', 'abstract', 'impossible', 'bizarre'],
            elements: ['melting clocks', 'floating objects', 'impossible architecture', 'distorted reality', 'fragmented forms'],
            environment: ['desert', 'dreamscape', 'cosmic void', 'strange landscape', 'impossible space'],
            style: ['surrealist', 'dreamlike', 'psychological', 'abstract', 'Salvador Dali-esque'],
            medium: ['oil painting', 'digital art', 'mixed media', 'fine art', 'surrealist painting'],
            artist: ['by Salvador Dali', 'by René Magritte', 'by surrealist masters', 'by dream artists'],
            quality: ['highly detailed', 'masterpiece', 'award-winning', 'ultra-detailed', 'cinematic lighting', 'high fidelity']
        },
        negativeAdditions: 'boring, mundane, basic, realistic, photorealistic, amateur, poorly composed, signature, watermark'
    },
    stillLife: {
        basePrompt: '[subject] still life, [arrangement], [lighting], [style], [medium], [artist], [quality]',
        keyElements: {
            subject: ['fruits', 'flowers', 'household objects', 'food', 'antiques', 'books'],
            arrangement: ['on a table', 'in a bowl', 'carefully arranged', 'rustic setting', 'minimalist composition'],
            lighting: ['soft natural light', 'dramatic chiaroscuro', 'warm lighting', 'studio lighting', 'rich colors'],
            style: ['classical', 'contemporary', 'photorealistic', 'painterly', 'vibrant'],
            medium: ['oil painting', 'photograph', 'watercolor', 'digital art', 'professional photograph'],
            artist: ['by Dutch masters', 'by Morandi', 'by contemporary still life artists'],
            quality: ['highly detailed', 'masterpiece', 'ultra high definition', 'professional quality', 'rich textures', 'vibrant']
        },
        negativeAdditions: 'blurry, poorly arranged, messy, amateur, low quality, oversaturated, bad composition, flat lighting'
    }
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