  promptAssistant,
  runConsoleInterface,
  setupExpressServer
};

// If this script is run directly (not imported), start the interface
if (require.main === module) {
  // Check for --web flag
  if (process.argv.includes('--web')) {
    try {
      require.resolve('express');
      setupExpressServer();
    } catch (e) {
      console.error('Express.js is required for the web interface. Please install it with: npm install express');
      process.exit(1);
    }
  } else {
    // Default to console interface
    runConsoleInterface();
  }
}
                    ],
                    workflow: [
                        {
                            name: "Two-stage refinement",
                            description: "Generate basic concept then refine with img2img",
                            implementation: "Create initial image at lower resolution/quality, then refine with img2img at medium strength",
                            example: "Generate 512x512 concept, then use as reference for 1024x1024 with 0.5 strength"
                        },
                        {
                            name: "Targeted inpainting",
                            description: "Using inpainting to fix specific problem areas",
                            implementation: "Generate full image, then mask and inpaint just problematic areas with focused prompts",
                            example: "Mask hands in a portrait and inpaint with 'perfect hands, detailed fingers, anatomically correct'"
                        },
                        {
                            name: "Style-content separation",
                            description: "Develop content and style separately before combining",
                            implementation: "Create structure with neutral style, then apply artistic style with img2img",
                            example: "Generate realistic scene first, then transform to watercolor with img2img at 0.7 strength"
                        }
                    ]
                };
                
                let html = '';
                techniques[technique].forEach(tech => {
                    html += `
                        <div class="technique-card">
                            <div class="technique-title">${tech.name}</div>
                            <p>${tech.description}</p>
                            <p><strong>Implementation:</strong> ${tech.implementation}</p>
                            <div class="example-prompt">Example: ${tech.example}</div>
                        </div>
                    `;
                });
                
                // Add model-specific notes
                if (technique === 'emphasis') {
                    html += `
                        <div class="panel">
                            <h4>Model-Specific Notes:</h4>
                            <p><strong>SDXL:</strong> Responds better to clear descriptions rather than special formatting</p>
                            <p><strong>SD 1.5:</strong> Benefits significantly from emphasis techniques, especially parentheses</p>
                        </div>
                    `;
                }
                
                document.getElementById('techniques-content').innerHTML = html;
            }
            
            // Load initial techniques
            loadTechniques('emphasis');
            
            // Content templates tabs
            const templateTabs = document.querySelectorAll('[data-template]');
            templateTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const container = this.closest('.tabs');
                    container.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const template = this.getAttribute('data-template');
                    loadTemplate(template);
                });
            });
            
            function loadTemplate(templateType) {
                // Simulate loading templates - in real implementation, would call API
                const templates = {
                    portrait: {
                        structure: "[gender], [age], [distinctive features], [emotion/expression], [clothing], [lighting], [background], [style], [quality]",
                        examples: [
                            "Young woman with freckles, serene expression, wearing casual summer dress, soft natural lighting, blurred forest background, digital painting, highly detailed",
                            "Elderly man with weathered face, determined expression, wearing formal suit, dramatic side lighting, dark gradient background, oil painting style, 4K resolution"
                        ]
                    },
                    character: {
                        structure: "[character type], [distinctive features], [attire/equipment], [pose/action], [expression], [setting/background], [lighting], [style], [quality]",
                        examples: [
                            "Cyberpunk mercenary with neon blue mohawk, wearing high-tech armor, crouching on rooftop, focused expression, futuristic cityscape background, blue and purple neon lighting, digital art, highly detailed",
                            "Fantasy wizard with long white beard, ornate magical robes, casting spell, intense expression, ancient library setting, magical glow lighting, oil painting style, 8K resolution"
                        ]
                    },
                    landscape: {
                        structure: "[location/environment type], [time of day], [weather/atmosphere], [distinctive features], [foreground elements], [middle ground], [background elements], [lighting], [style], [quality]",
                        examples: [
                            "Tropical beach at sunset, clear sky with few clouds, white sand, palm trees in foreground, small wooden boats in water, mountains in distance, golden hour lighting, digital painting, highly detailed",
                            "Snowy mountain range at dawn, misty atmosphere, pine forest in foreground, frozen lake in middle, towering peaks in background, soft morning lighting, watercolor style, 8K resolution"
                        ]
                    },
                    concept: {
                        structure: "[concept type], [distinctive features], [materials/textures], [environment/context], [lighting], [perspective/angle], [style], [quality]",
                        examples: [
                            "Futuristic vehicle concept, sleek aerodynamic design, carbon fiber and chrome materials, hovering above neon-lit street, dramatic underlighting, 3/4 view, 3D render, highly detailed",
                            "Fantasy weapon design, ornate crystal sword, engraved metal hilt with glowing runes, displayed on velvet cloth, museum lighting, straight-on perspective, digital illustration, 4K resolution"
                        ]
                    }
                };
                
                const template = templates[templateType];
                
                document.getElementById('template-structure').textContent = template.structure;
                
                let examplesHtml = '<div class="grid">';
                template.examples.forEach(example => {
                    examplesHtml += `
                        <div class="card">
                            <div>${example}</div>
                            <button class="copy-button" data-text="${example}">Copy</button>
                        </div>
                    `;
                });
                examplesHtml += '</div>';
                
                document.getElementById('template-examples').innerHTML = examplesHtml;
                
                // Add event listeners to copy buttons
                document.querySelectorAll('.copy-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const text = this.getAttribute('data-text');
                        navigator.clipboard.writeText(text).then(() => {
                            this.textContent = 'Copied!';
                            setTimeout(() => {
                                this.textContent = 'Copy';
                            }, 2000);
                        });
                    });
                });
            }
            
            // Load initial template
            loadTemplate('portrait');
            
            // ControlNet tabs
            const controlnetTabs = document.querySelectorAll('[data-controlnet]');
            controlnetTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const container = this.closest('.tabs');
                    container.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const mode = this.getAttribute('data-controlnet');
                    loadControlNet(mode);
                });
            });
            
            function loadControlNet(mode) {
                // Simulate loading ControlNet info - in real implementation, would call API
                const controlNetModes = {
                    openPose: {
                        title: "Open Pose",
                        description: "Extracts a person's pose from an input image, allowing you to create new images with figures in the same position.",
                        bestFor: ["Character poses", "Maintaining consistent body positions", "Human figures"],
                        usage: "Upload a reference image with the desired pose, then describe the character/person you want to generate in that pose."
                    },
                    kennyMode: {
                        title: "Kenny Mode (Edge Detection)",
                        description: "Extracts edges from an image to influence the structure of a new creation. This is the default mode and works well for basic structural guidance.",
                        bestFor: ["General structure guidance", "Object placement", "Scene layouts"],
                        usage: "Upload a reference image with the desired structure, then describe the style and details you want in your new image."
                    },
                    depthMode: {
                        title: "Depth Mode",
                        description: "Detects the depth information in an image, creating more photorealistic results by preserving spatial relationships.",
                        bestFor: ["Realistic scenes", "3D space preservation", "Maintaining perspective"],
                        usage: "Upload a reference image with the desired depth and spatial arrangement, then describe the style and details for your new image."
                    },
                    lineArtMode: {
                        title: "Line Art Mode",
                        description: "Provides detailed edge detection, particularly useful for anime-style or intricate drawings.",
                        bestFor: ["Anime/manga style", "Illustrations", "Sketches to finished art"],
                        usage: "Upload a line drawing or sketch, then describe the colors, style, and details you want in the finished piece."
                    },
                    ipAdapterMode: {
                        title: "IP Adapter Mode",
                        description: "Applied style influence rather than structural guidance, allowing you to transfer the aesthetic feel from one image to another.",
                        bestFor: ["Style transfer", "Consistent aesthetics", "Visual theme matching"],
                        usage: "Upload a reference image with the desired style, then describe the content you want in that style."
                    }
                };
                
                const controlNetInfo = controlNetModes[mode];
                
                document.getElementById('controlnet-title').textContent = controlNetInfo.title;
                document.getElementById('controlnet-description').textContent = controlNetInfo.description;
                
                let usesHtml = '';
                controlNetInfo.bestFor.forEach(use => {
                    usesHtml += `<li>${use}</li>`;
                });
                
                document.getElementById('controlnet-uses').innerHTML = usesHtml;
                document.getElementById('controlnet-usage').textContent = controlNetInfo.usage;
            }
            
            // Load initial controlnet mode
            loadControlNet('openPose');
            
            // Parameter guidance tabs
            const paramTabs = document.querySelectorAll('[data-param]');
            paramTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const container = this.closest('.tabs');
                    container.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const param = this.getAttribute('data-param');
                    loadParameterGuidance(param);
                });
            });
            
            function loadParameterGuidance(param) {
                // Get selected model
                const modelButton = document.querySelector('#parameter-optimizer .model-selector .active');
                const model = modelButton.getAttribute('data-model');
                
                // Simulate parameter guidance - in real implementation, would call API
                const guidance = {
                    cfg: {
                        sdxl: [
                            "5-7: This lower range gives the AI more creative freedom",
                            "7-9: This balanced range provides good prompt adherence while avoiding artifacts",
                            "9-11: SDXL works well with slightly lower CFG than SD 1.5 for precise results"
                        ],
                        sd15: [
                            "5-7: This lower range gives the AI more creative freedom",
                            "7-9: This balanced range provides good prompt adherence while avoiding artifacts",
                            "11-13: SD 1.5 may require higher CFG values for strict prompt adherence"
                        ],
                        sd21: [
                            "5-7: This lower range gives the AI more creative freedom",
                            "7-9: This balanced range provides good prompt adherence while avoiding artifacts",
                            "10-12: This higher range forces closer adherence to your prompt"
                        ],
                        juggernautxl: [
                            "3-4: Ultra creative freedom with more artistic interpretation",
                            "4-6: Optimal range for photorealistic portraits, maintains realism without artifacts",
                            "6-7: Higher adherence for specific details while preserving naturalistic look"
                        ],
                        fluxdev: [
                            "5-6: Balanced range for text incorporation with creative elements",
                            "7-8: Good for detailed technical images and text accuracy",
                            "8-9: Maximum detail for complex scenes with text elements"
                        ],
                        juggernautfluxpro: [
                            "4-5: Ideal for natural skin textures and photorealism",
                            "5-7: Balanced range for most photographic styles",
                            "7-8: Enhanced detail without compromising naturalistic textures"
                        ],
                        fluxpro: [
                            "5-7: Standard range for professional compositions",
                            "7-9: Increased detail retention for commercial work",
                            "9-10: Maximum adherence for technical and professional outputs"
                        ],
                        sdxlfilm: [
                            "5-7: Enhances film grain while maintaining creative interpretation",
                            "7-9: Balances film aesthetics with prompt adherence",
                            "9-10: Maximum detail while preserving film qualities"
                        ]
                    },
                    steps: {
                        sdxl: [
                            "20-25: Lower steps for quick drafts and iterations",
                            "30-40: Standard quality for most purposes",
                            "40-50: SDXL produces high quality with fewer steps than SD 1.5"
                        ],
                        sd15: [
                            "15-20: SD 1.5 can produce usable drafts with very few steps",
                            "30-40: Standard quality for most purposes",
                            "45-60: Higher steps for detailed final images"
                        ],
                        sd21: [
                            "20-25: Lower steps for quick drafts and iterations",
                            "30-40: Standard quality for most purposes",
                            "45-60: Higher steps for detailed final images"
                        ],
                        juggernautxl: [
                            "20-25: Quick drafts with good quality",
                            "30-40: Recommended steps for most portrait work",
                            "40-50: Maximum detail for portrait close-ups and complex scenes"
                        ],
                        fluxdev: [
                            "15-20: Draft quality for testing text placement",
                            "28-35: Optimal range for most use cases, significant quality improvement",
                            "35-40: Maximum detail for commercial or print outputs"
                        ],
                        juggernautfluxpro: [
                            "20-30: High quality even at lower step counts",
                            "30-40: Optimal range for most photorealistic work",
                            "40-50: Professional quality for commercial work and high-resolution outputs"
                        ],
                        fluxpro: [
                            "20-25: Preliminary iterations with good quality",
                            "25-35: Standard range for most professional uses",
                            "35-45: Maximum detail for complex professional compositions"
                        ],
                        sdxlfilm: [
                            "25-30: Standard range for film effect application",
                            "30-40: Recommended for optimal grain and film characteristics",
                            "40-50: Maximum refinement of film qualities and tonal range"
                        ]
                    },
                    sampler: {
                        sdxl: [
                            "DDIM: Fastest generation, good for quick tests",
                            "Euler a: Good balance of quality and speed for most purposes",
                            "DPM++ 2M Karras: Optimal quality sampler for SDXL, especially for portraits and photorealism",
                            "UniPC: Best for architecture and technical illustrations"
                        ],
                        sd15: [
                            "DDIM: Fastest generation, good for quick tests",
                            "Euler a: Particularly good all-around sampler for SD 1.5",
                            "DPM++ 2M Karras: Highest quality but slower processing",
                            "UniPC: Best for architecture and technical illustrations"
                        ],
                        sd21: [
                            "DDIM: Fastest generation, good for quick tests",
                            "Euler a: Good balance of quality and speed for most purposes",
                            "DPM++ 2M Karras: Highest quality but slower processing",
                            "UniPC: Best for architecture and technical illustrations"
                        ],
                        juggernautxl: [
                            "DPM++ 2M SDE: Most consistent results, optimal for portrait work",
                            "Euler a: Good for quick tests and iterations",
                            "DPM++ 2M Karras: Excellent alternative for skin texture detail",
                            "UniPC: Good for architectural elements and backgrounds"
                        ],
                        fluxdev: [
                            "Euler a: Balanced results for text and visual elements",
                            "DPM++ 2M Karras: Optimal for detailed textures and text accuracy",
                            "UniPC: Excellent for technical illustrations and diagrams",
                            "DDIM: Fastest results when testing text layouts"
                        ],
                        juggernautfluxpro: [
                            "DPM++ 2M Karras: Optimal for skin textures and photorealism",
                            "Euler a: Faster option with good results",
                            "DPM++ SDE: Best balance of quality and speed",
                            "DDIM: For quick iterations and concept testing"
                        ],
                        fluxpro: [
                            "DPM++ 2M Karras: Best quality for professional work",
                            "Euler a: Good balance of speed and quality",
                            "DPM++ SDE: Excellent detail for professional outputs",
                            "UniPC: Best for technical and specialized content"
                        ],
                        sdxlfilm: [
                            "DPM++ 2M Karras: Recommended for most authentic film look",
                            "Euler a: Faster option that preserves film grain well",
                            "DPM++ SDE: Good balance of film quality and generation speed",
                            "DDIM: For quick film style tests"
                        ]
                    },
                    strength: {
                        sdxl: [
                            "0.15-0.35: SDXL can make effective subtle changes with lower strength values",
                            "0.5-0.6: Balanced transformation that allows significant changes while maintaining composition",
                            "0.7-0.9: Major transformation using original as loose inspiration"
                        ],
                        sd15: [
                            "0.2-0.4: Subtle changes that preserve most of the original image",
                            "0.5-0.6: Balanced transformation that allows significant changes while maintaining composition",
                            "0.7-0.9: Major transformation using original as loose inspiration"
                        ],
                        sd21: [
                            "0.2-0.4: Subtle changes that preserve most of the original image",
                            "0.5-0.6: Balanced transformation that allows significant changes while maintaining composition",
                            "0.7-0.9: Major transformation using original as loose inspiration"
                        ],
                        juggernautxl: [
                            "0.15-0.3: Ideal for subtle portrait retouching with natural results",
                            "0.4-0.6: Good for significant changes while maintaining realistic features",
                            "0.6-0.8: Major transformations while preserving core identity"
                        ],
                        fluxdev: [
                            "0.2-0.3: Subtle enhancement while maintaining accurate text",
                            "0.4-0.6: Balanced for visual changes while preserving text integrity",
                            "0.6-0.8: Major visual transformation with text regeneration"
                        ],
                        juggernautfluxpro: [
                            "0.15-0.25: Ultra-refined subtle changes with natural skin preservation",
                            "0.3-0.5: Significant enhancements while maintaining photorealistic quality",
                            "0.5-0.7: Major transformations with superior skin and texture quality"
                        ],
                        fluxpro: [
                            "0.2-0.4: Professional refinement with subtle enhancements",
                            "0.4-0.6: Significant changes for commercial quality results",
                            "0.6-0.8: Complete transformation while maintaining professional quality"
                        ],
                        sdxlfilm: [
                            "0.7-0.8: Recommended strength for applying film effect to existing images",
                            "0.5-0.7: Lighter film effect that preserves more of the original image",
                            "0.8-0.9: Maximum film effect transformation for authentic analog look"
                        ]
                    }
                };
                
                let html = `<h4>${param.toUpperCase()} Scale Guidance for ${model.toUpperCase()}:</h4><ul class="suggestions-list">`;
                guidance[param][model].forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += '</ul>';
                
                document.getElementById('parameter-guidance').innerHTML = html;
            }
            
            // Load initial parameter guidance
            loadParameterGuidance('cfg');
            
            // Get optimized parameters
            document.getElementById('optimize-parameters').addEventListener('click', function() {
                const contentType = document.getElementById('content-type').value;
                const modelButton = document.querySelector('#parameter-optimizer .model-selector .active');
                const model = modelButton.getAttribute('data-model');
                
                // Simulate getting parameter recommendations - in real implementation, would call API
                const paramSets = {
                    portrait: {
                        sdxl: {
                            description: "Parameters optimized for portrait generation with SDXL",
                            cfg: "7-9",
                            steps: "30-40",
                            sampler: "DPM++ 2M Karras",
                            width: 1024,
                            height: 1024,
                            notes: "Portraits benefit from slightly higher CFG for facial details. SDXL is excellent for realistic faces.",
                            refinement: true,
                            refinementRatio: 0.2
                        },
                        sd15: {
                            description: "Parameters optimized for portrait generation with SD 1.5",
                            cfg: "8-10",
                            steps: "35-45",
                            sampler: "DPM++ 2M Karras",
                            width: 512,
                            height: 768,
                            notes: "SD 1.5 requires comprehensive negative prompts to achieve good faces. Consider using specific style references."
                        }
                    },
                    landscape: {
                        sdxl: {
                            description: "Parameters optimized for landscape generation with SDXL",
                            cfg: "6-8",
                            steps: "30-40",
                            sampler: "DPM++ 2M Karras",
                            width: 1024,
                            height: 768,
                            notes: "Landscapes work well with lower CFG for more creative interpretation. SDXL handles wide aspect ratios well.",
                            refinement: true,
                            refinementRatio: 0.2
                        },
                        sd15: {
                            description: "Parameters optimized for landscape generation with SD 1.5",
                            cfg: "6-8",
                            steps: "30-40",
                            sampler: "Euler a",
                            width: 768,
                            height: 512,
                            notes: "Landscapes work well with lower CFG for more creative interpretation. Use artist references for better results."
                        }
                    },
                    // Other content types would follow the same pattern
                };
                
                // Get parameter set or fallback to default
                let paramSet;
                if (paramSets[contentType] && paramSets[contentType][model]) {
                    paramSet = paramSets[contentType][model];
                } else {
                    // Default fallback
                    paramSet = {
                        description: `General purpose parameters for ${model.toUpperCase()}`,
                        cfg: "7-9",
                        steps: "30-40",
                        sampler: model === "sdxl" ? "DPM++ 2M Karras" : "Euler a",
                        width: model === "sdxl" ? 1024 : 512,
                        height: model === "sdxl" ? 1024 : 512,
                        notes: "Balanced parameters for general use cases"
                    };
                }
                
                // Display parameter recommendations
                let html = `
                    <p><strong>Description:</strong> ${paramSet.description}</p>
                    <p><strong>Recommended CFG range:</strong> ${paramSet.cfg}</p>
                    <p><strong>Recommended sampler:</strong> ${paramSet.sampler}</p>
                    <p><strong>Recommended step count:</strong> ${paramSet.steps}</p>
                    <p><strong>Recommended resolution:</strong> ${paramSet.width}x${paramSet.height}</p>
                    <p><strong>Note:</strong> ${paramSet.notes}</p>
                `;
                
                // Add SDXL refinement info if applicable
                if (paramSet.refinement) {
                    html += `
                        <div class="panel">
                            <h4>SDXL Refinement:</h4>
                            <p>Enabled with recommended strength: ${paramSet.refinementRatio}</p>
                            <p>Refinement improves details and coherence in the final image</p>
                        </div>
                    `;
                }
                
                document.getElementById('parameters').innerHTML = html;
                document.getElementById('parameter-result').style.display = 'block';
            });
            
            // Result analyzer
            document.getElementById('analyze-result').addEventListener('click', function() {
                const prompt = document.getElementById('prompt-used').value;
                const description = document.getElementById('result-description').value;
                const subjectType = document.getElementById('subject-type').value;
                const model = document.querySelector('#result-analyzer .model-selector .active').getAttribute('data-model');
                
                // Basic validation
                if (!prompt || !description) {
                    alert('Please enter both prompt and result description');
                    return;
                }
                
                // Simulate getting analysis - in real implementation, would call API
                simulateAnalysis(prompt, description, subjectType, model);
            });
            
            function simulateAnalysis(prompt, description, subjectType, model) {
                // Generate suggestions based on description and model
                const suggestions = [];
                
                // Check for hand issues
                if (description.toLowerCase().includes("hand") || 
                    description.toLowerCase().includes("finger") || 
                    description.toLowerCase().includes("deformed")) {
                    
                    suggestions.push("Add 'perfect hands, accurate anatomy' to your prompt");
                    
                    if (model === 'sdxl') {
                        suggestions.push("Add 'bad hands, extra fingers, missing fingers, deformed' to your negative prompt");
                        suggestions.push("For SDXL, consider using higher CFG (9-10) for better anatomical accuracy");
                    } else {
                        suggestions.push("For SD 1.5, add specific details about hands in the negative prompt: 'bad hands, extra fingers, missing fingers, deformed, mutated hands'");
                        suggestions.push("Consider using SDXL for better anatomical accuracy if available");
                    }
                }
                
                // Check for composition issues
                if (description.toLowerCase().includes("composition") || 
                    description.toLowerCase().includes("framing")) {
                    suggestions.push("Add specific composition terms like 'rule of thirds, professional composition'");
                    suggestions.push("Consider using a reference image with img2img at low strength (0.3-0.4)");
                    suggestions.push("Try ControlNet with Kenny Mode (edge detection) to control composition");
                }
                
                // Check for style issues
                if (description.toLowerCase().includes("style") || 
                    description.toLowerCase().includes("inconsistent")) {
                    if (model === 'sdxl') {
                        suggestions.push("SDXL works best with clear style descriptions rather than artist references");
                    } else {
                        suggestions.push("SD 1.5 benefits from artist references - try adding 'in the style of [artist name]'");
                        suggestions.push("Add 'trending on artstation' for a more cohesive digital art style");
                    }
                }
                
                // If no specific issues, provide general suggestions
                if (suggestions.length === 0) {
                    suggestions.push("Try increasing your CFG value for closer prompt adherence");
                    suggestions.push("Add quality enhancers like '8K, highly detailed, masterpiece'");
                    suggestions.push("Try different seeds to see alternative interpretations");
                }
                
                // Next steps
                const nextSteps = [
                    "Try a slightly higher CFG value for more precise prompt adherence",
                    "Experiment with different samplers to see which works best for this content",
                    "Consider adding more specific descriptive terms for key elements",
                    "If composition is good but details need work, try img2img with strength 0.4-0.5",
                    "Save successful seeds for consistent results in future iterations"
                ];
                
                // Subject-specific analysis
                let commonIssues = [];
                let commonSolutions = [];
                
                if (subjectType) {
                    // Simulate subject-specific analysis - in real implementation, would call API
                    const subjectAnalysis = {
                        portrait: {
                            issues: [
                                "Deformed or unnatural facial features",
                                "Unnatural or malformed hands",
                                "Strange body proportions",
                                "Inconsistent lighting on face"
                            ],
                            solutions: [
                                "Add 'symmetrical face, realistic features, detailed' to your prompt",
                                "Add detailed hand descriptions or avoid showing hands",
                                "Use ControlNet with pose reference for better proportions",
                                "Specify lighting direction (e.g., 'from the left side')"
                            ]
                        },
                        landscape: {
                            issues: [
                                "Unrealistic scale of elements",
                                "Poor perspective and depth",
                                "Inconsistent lighting across the scene",
                                "Unnatural terrain features"
                            ],
                            solutions: [
                                "Describe foreground, midground, and background elements explicitly",
                                "Add 'wide angle lens' or specific focal length",
                                "Specify time of day and light source direction",
                                "Reference real geographic features (e.g., 'like Scottish Highlands')"
                            ]
                        },
                        character: {
                            issues: [
                                "Inconsistent character features across images",
                                "Unrealistic clothing or armor details",
                                "Poor character proportions",
                                "Unnatural poses"
                            ],
                            solutions: [
                                "Use same seed and consistent character description",
                                "Reference specific materials and design styles",
                                "Add 'anatomically correct, proper proportions'",
                                "Use ControlNet with pose reference"
                            ]
                        }
                    };
                    
                    if (subjectAnalysis[subjectType]) {
                        commonIssues = subjectAnalysis[subjectType].issues;
                        commonSolutions = subjectAnalysis[subjectType].solutions;
                        
                        // Add model-specific solutions
                        if (model === 'sdxl') {
                            commonSolutions.push("SDXL generally produces better anatomy - increase CFG slightly for more precision");
                        } else if (model === 'sd15') {
                            commonSolutions.push("SD 1.5 may require more detailed negative prompts to avoid anatomical issues");
                        }
                    }
                }
                
                // Display analysis results
                let suggestionsHtml = '<ul class="suggestions-list">';
                suggestions.forEach(suggestion => {
                    suggestionsHtml += `<li>${suggestion}</li>`;
                });
                suggestionsHtml += '</ul>';
                
                document.getElementById('suggestions').innerHTML = suggestionsHtml;
                
                let nextStepsHtml = '<ul class="suggestions-list">';
                nextSteps.forEach(step => {
                    nextStepsHtml += `<li>${step}</li>`;
                });
                nextStepsHtml += '</ul>';
                
                document.getElementById('next-steps').innerHTML = nextStepsHtml;
                
                // Display subject-specific analysis if available
                if (subjectType && commonIssues.length > 0) {
                    document.getElementById('subject-type-label').textContent = subjectType;
                    
                    let issuesHtml = '<ul class="suggestions-list">';
                    commonIssues.forEach(issue => {
                        issuesHtml += `<li>${issue}</li>`;
                    });
                    issuesHtml += '</ul>';
                    
                    document.getElementById('common-issues').innerHTML = issuesHtml;
                    
                    let solutionsHtml = '<ul class="suggestions-list">';
                    commonSolutions.forEach(solution => {
                        solutionsHtml += `<li>${solution}</li>`;
                    });
                    solutionsHtml += '</ul>';
                    
                    document.getElementById('common-solutions').innerHTML = solutionsHtml;
                    document.getElementById('subject-specific').style.display = 'block';
                } else {
                    document.getElementById('subject-specific').style.display = 'none';
                }
                
                document.getElementById('analysis-result').style.display = 'block';
            }
            
            // Negative prompts
            document.getElementById('get-negative-prompt').addEventListener('click', function() {
                const useCase = document.getElementById('use-case').value;
                const model = document.querySelector('#negative-prompts .model-selector .active').getAttribute('data-model');
                
                // Simulate getting negative prompt - in real implementation, would call API
                const negativePrompts = {
                    general: {
                        sdxl: "ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, bad art, beginner, amateur",
                        sd15: "ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra fingers, extra arms, disfigured, deformed, body out of frame, blurry, bad art, bad anatomy, watermark, signature, cut off"
                    },
                    portrait: {
                        sdxl: "blurry, bad anatomy, bad hands, extra fingers, missing fingers, extra limbs, deformed, disfigured, poorly drawn face, mutation, mutated, disconnected limbs, malformed hands, long neck, text, watermark",
                        sd15: "bad hands, cropped head, out of frame, extra fingers, mutated hands, mutation, deformed face, blurry, bad anatomy, disfigured, poorly drawn face, cloned face, extra face, close up"
                    },
                    landscape: {
                        sdxl: "blurry, bad perspective, low resolution, skewed horizon, poor composition, distorted perspective, unrealistic scale, watermark, signature, text, ugly, tiling, out of frame",
                        sd15: "blurry, bad anatomy, bad perspective, low resolution, skewed horizon, poor composition, distorted perspective, unrealistic scale, watermark, signature, text, ugly, tiling, out of frame"
                    },
                    anime: {
                        sdxl: "bad anatomy, bad hands, extra digits, fewer digits, extra limbs, missing limbs, disconnected limbs, malformed hands, blurry, mutated, disfigured, poorly drawn, duplicate, cross-eyed",
                        sd15: "bad anatomy, bad hands, extra digits, fewer digits, extra limbs, missing limbs, disconnected limbs, malformed hands, blurry, mutated, disfigured, poorly drawn, duplicate, extra fingers, mutated hands, mutation, deformed, cross-eyed"
                    },
                    realistic: {
                        sdxl: "cartoon, anime, illustration, painting, drawing, art, unrealistic, unnatural colors, surreal, fantasy, artificial, synthetic, digital art, amateur",
                        sd15: "cartoon, anime, illustration, painting, drawing, art, unrealistic, unnatural colors, surreal, fantasy, artificial, synthetic, digital art, amateur, unprofessional, text, watermark, logo, signature"
                    }
                };
                
                // Get negative prompt or fallback to general
                let negativePrompt;
                if (negativePrompts[useCase] && negativePrompts[useCase][model]) {
                    negativePrompt = negativePrompts[useCase][model];
                } else {
                    negativePrompt = negativePrompts.general[model];
                }
                
                document.getElementById('final-negative-prompt').textContent = negativePrompt;
                document.getElementById('negative-prompt-result').style.display = 'block';
            });
            
            // Copy negative prompt
            document.getElementById('copy-negative-prompt').addEventListener('click', function() {
                const text = document.getElementById('final-negative-prompt').textContent;
                navigator.clipboard.writeText(text).then(() => {
                    alert('Negative prompt copied to clipboard!');
                });
            });
            
            // Simulate loading saved prompts
            document.getElementById('saved-prompts').innerHTML = `
                <div class="card">
                    <p><strong>Fantasy Landscape</strong></p>
                    <p>March 10, 2025</p>
                    <p class="small">Epic mountain landscape, medieval castle...</p>
                    <button class="copy-button">Load</button>
                </div>
                <div class="card">
                    <p><strong>Cyberpunk Character</strong></p>
                    <p>March 11, 2025</p>
                    <p class="small">Cyberpunk mercenary with neon blue...</p>
                    <button class="copy-button">Load</button>
                </div>
            `;
            
            // Save prompt button
            document.getElementById('save-prompt').addEventListener('click', function() {
                // In a real implementation, this would call your API
                alert('Prompt saved successfully!');
            });
        });
    </script>
</body>
</html>
`;

// Main application execution
module.exports = {
  promptAssistant,
  runConsoleInterface,
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .card {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        
        .tabs {
            display: flex;
            margin-bottom: 20px;
            background-color: #f1f1f1;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .tab-button {
            flex: 1;
            padding: 12px;
            border: none;
            background-color: transparent;
            cursor: pointer;
            text-align: center;
            transition: background-color 0.3s ease, color 0.3s ease;
            font-weight: 600;
        }
        
        .tab-button.active {
            background-color: #2c3e50;
            color: white;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .technique-card {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
        }
        
        .technique-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #2c3e50;
        }
        
        .example-prompt {
            background-color: #e8f4f8;
            padding: 10px;
            border-radius: 6px;
            margin-top: 8px;
            font-family: monospace;
        }
        
        .copy-button {
            background-color: #95a5a6;
            padding: 5px 10px;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .suggestions-list {
            margin-top: 10px;
        }
        
        .suggestions-list li {
            margin-bottom: 8px;
            padding-left: 5px;
        }
        
        footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 14px;
            padding: 20px;
        }
        
        .model-selector {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .model-button {
            flex: 1;
            padding: 10px;
            background-color: #f1f1f1;
            border: 1px solid #ddd;
            border-radius: 6px;
            cursor: pointer;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .model-button.active {
            background-color: #2c3e50;
            color: white;
            border-color: #2c3e50;
        }
        
        @media (max-width: 900px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar, .main-content {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>Enhanced Stable Diffusion Prompt Assistant</h1>
        <p>Create optimized prompts and settings for AI image generation</p>
    </header>
    
    <div class="container">
        <div class="sidebar">
            <h2>Tools</h2>
            <ul id="tools">
                <li><a href="#" data-tab="prompt-builder">Prompt Builder</a></li>
                <li><a href="#" data-tab="negative-prompts">Negative Prompts</a></li>
                <li><a href="#" data-tab="parameter-optimizer">Parameter Optimizer</a></li>
                <li><a href="#" data-tab="result-analyzer">Result Analyzer</a></li>
                <li><a href="#" data-tab="advanced-techniques">Advanced Techniques</a></li>
                <li><a href="#" data-tab="content-templates">Content Templates</a></li>
                <li><a href="#" data-tab="openart-models">OpenArt AI Models</a></li>
                <li><a href="#" data-tab="controlnet-guidance">ControlNet Guidance</a></li>
            </ul>
            
            <h2>Saved Prompts</h2>
            <div id="saved-prompts">
                <p>Loading saved prompts...</p>
            </div>
        </div>
        
        <div class="main-content">
            <!-- Prompt Builder Tab -->
            <div id="prompt-builder" class="tab-content active">
                <h2>Prompt Builder</h2>
                <p>Build an effective prompt with the recommended structure</p>
                
                <div class="model-selector">
                    <div class="model-button active" data-model="sdxl">Stable Diffusion XL</div>
                    <div class="model-button" data-model="sd15">Stable Diffusion 1.5</div>
                    <div class="model-button" data-model="sd21">Stable Diffusion 2.1</div>
                    <div class="model-button" data-model="juggernautxl">Juggernaut XL</div>
                    <div class="model-button" data-model="fluxdev">Flux (Dev)</div>
                    <div class="model-button" data-model="juggernautfluxpro">Juggernaut Flux Pro</div>
                    <div class="model-button" data-model="fluxpro">Flux (Pro)</div>
                    <div class="model-button" data-model="sdxlfilm">SDXL Film</div>
                </div>
                
                <div class="model-info" id="model-specific-info">
                    <p><strong>SDXL Notes:</strong> Less reliant on explicit quality terms, handles longer contexts better, more literal interpretation</p>
                </div>
                
                <div class="panel">
                    <label for="subject">Main Subject:</label>
                    <input type="text" id="subject" placeholder="What/who is the focus? (e.g., a medieval knight)">
                    
                    <label for="details">Details & Modifiers:</label>
                    <textarea id="details" placeholder="Specific characteristics, environment, etc. (e.g., standing on a battlefield at sunset)"></textarea>
                    
                    <label for="style">Art Style & Medium:</label>
                    <input type="text" id="style" placeholder="The artistic approach (e.g., oil painting, cinematic lighting)">
                    
                    <label for="quality">Technical Quality:</label>
                    <input type="text" id="quality" placeholder="Resolution and rendering parameters (e.g., 8K, ultra-sharp focus)">
                    
                    <div>
                        <input type="checkbox" id="use-emphasis" checked>
                        <label for="use-emphasis" style="display:inline">Use emphasis techniques (parentheses, etc.)</label>
                    </div>
                    
                    <button id="build-prompt">Generate Prompt</button>
                </div>
                
                <div class="panel">
                    <h3>Suggested Modifiers</h3>
                    
                    <div class="tabs">
                        <button class="tab-button active" data-modifier="quality">Quality</button>
                        <button class="tab-button" data-modifier="lighting">Lighting</button>
                        <button class="tab-button" data-modifier="medium">Medium</button>
                        <button class="tab-button" data-modifier="artists">Artists</button>
                        <button class="tab-button" data-modifier="film">Camera/Film</button>
                    </div>
                    
                    <div id="modifiers-content">
                        <p>Select a category to see suggested modifiers</p>
                    </div>
                </div>
                
                <div class="result" id="prompt-result" style="display: none;">
                    <h3>Your Optimized Prompt:</h3>
                    <div id="final-prompt"></div>
                    <div id="token-counter" class="token-count good">Estimated tokens: 0/75</div>
                    <div id="prompt-analysis"></div>
                    <button id="save-prompt">Save Prompt</button>
                    <button id="copy-prompt">Copy to Clipboard</button>
                </div>
            </div>
            
            <!-- Negative Prompts Tab -->
            <div id="negative-prompts" class="tab-content">
                <h2>Negative Prompt Recommendations</h2>
                <p>Get tailored negative prompts to avoid unwanted elements</p>
                
                <div class="model-selector">
                    <div class="model-button active" data-model="sdxl">Stable Diffusion XL</div>
                    <div class="model-button" data-model="sd15">Stable Diffusion 1.5</div>
                    <div class="model-button" data-model="sd21">Stable Diffusion 2.1</div>
                    <div class="model-button" data-model="juggernautxl">Juggernaut XL</div>
                    <div class="model-button" data-model="fluxdev">Flux (Dev)</div>
                    <div class="model-button" data-model="juggernautfluxpro">Juggernaut Flux Pro</div>
                    <div class="model-button" data-model="fluxpro">Flux (Pro)</div>
                    <div class="model-button" data-model="sdxlfilm">SDXL Film</div>
                </div>
                
                <div class="model-info">
                    <p><strong>Model-specific note:</strong> <span id="negative-model-note">SDXL generally requires less extensive negative prompts than SD 1.5</span></p>
                </div>
                
                <div class="panel">
                    <label for="use-case">Select Use Case:</label>
                    <select id="use-case">
                        <option value="general">General Purpose</option>
                        <option value="portrait">Portrait/Character</option>
                        <option value="landscape">Landscape/Environment</option>
                        <option value="anime">Anime/Stylized</option>
                        <option value="realistic">Photorealistic</option>
                    </select>
                    
                    <button id="get-negative-prompt">Get Negative Prompt</button>
                </div>
                
                <div class="result" id="negative-prompt-result" style="display: none;">
                    <h3>Recommended Negative Prompt:</h3>
                    <div id="final-negative-prompt"></div>
                    <button id="copy-negative-prompt">Copy to Clipboard</button>
                </div>
            </div>
            
            <!-- Parameter Optimizer Tab -->
            <div id="parameter-optimizer" class="tab-content">
                <h2>Parameter Optimizer</h2>
                <p>Get optimized settings for different models and purposes</p>
                
                <div class="model-selector">
                    <div class="model-button active" data-model="sdxl">Stable Diffusion XL</div>
                    <div class="model-button" data-model="sd15">Stable Diffusion 1.5</div>
                    <div class="model-button" data-model="sd21">Stable Diffusion 2.1</div>
                    <div class="model-button" data-model="juggernautxl">Juggernaut XL</div>
                    <div class="model-button" data-model="fluxdev">Flux (Dev)</div>
                    <div class="model-button" data-model="juggernautfluxpro">Juggernaut Flux Pro</div>
                    <div class="model-button" data-model="fluxpro">Flux (Pro)</div>
                    <div class="model-button" data-model="sdxlfilm">SDXL Film</div>
                </div>
                
                <div class="panel">
                    <label for="content-type">Content Type:</label>
                    <select id="content-type">
                        <option value="portrait">Portrait/Character</option>
                        <option value="landscape">Landscape/Environment</option>
                        <option value="concept">Concept Art</option>
                        <option value="anime">Anime Style</option>
                        <option value="general">General Purpose</option>
                    </select>
                    
                    <button id="optimize-parameters">Get Recommendations</button>
                </div>
                
                <div class="panel">
                    <h3>Parameter Guidance</h3>
                    <div class="tabs">
                        <button class="tab-button active" data-param="cfg">CFG Scale</button>
                        <button class="tab-button" data-param="steps">Step Count</button>
                        <button class="tab-button" data-param="sampler">Sampler</button>
                        <button class="tab-button" data-param="strength">Img2Img Strength</button>
                    </div>
                    
                    <div id="parameter-guidance">
                        <p>Select a parameter type to see detailed guidance</p>
                    </div>
                </div>
                
                <div class="result" id="parameter-result" style="display: none;">
                    <h3>Optimized Parameters:</h3>
                    <div id="parameters"></div>
                </div>
            </div>
            
            <!-- Result Analyzer Tab -->
            <div id="result-analyzer" class="tab-content">
                <h2>Result Analyzer</h2>
                <p>Get improvement suggestions for your generations</p>
                
                <div class="model-selector">
                    <div class="model-button active" data-model="sdxl">Stable Diffusion XL</div>
                    <div class="model-button" data-model="sd15">Stable Diffusion 1.5</div>
                    <div class="model-button" data-model="sd21">Stable Diffusion 2.1</div>
                    <div class="model-button" data-model="juggernautxl">Juggernaut XL</div>
                    <div class="model-button" data-model="fluxdev">Flux (Dev)</div>
                    <div class="model-button" data-model="juggernautfluxpro">Juggernaut Flux Pro</div>
                    <div class="model-button" data-model="fluxpro">Flux (Pro)</div>
                    <div class="model-button" data-model="sdxlfilm">SDXL Film</div>
                </div>
                
                <div class="panel">
                    <label for="prompt-used">Prompt Used:</label>
                    <textarea id="prompt-used" placeholder="Enter the prompt you used for your generation"></textarea>
                    
                    <label for="result-description">Result Description:</label>
                    <textarea id="result-description" placeholder="Describe the results and any issues you encountered (e.g., distorted hands, poor composition)"></textarea>
                    
                    <label for="subject-type">Subject Type:</label>
                    <select id="subject-type">
                        <option value="">-- Select if applicable --</option>
                        <option value="portrait">Portrait/Person</option>
                        <option value="landscape">Landscape/Environment</option>
                        <option value="character">Character (fantasy, sci-fi, etc.)</option>
                    </select>
                    
                    <button id="analyze-result">Get Suggestions</button>
                </div>
                
                <div class="result" id="analysis-result" style="display: none;">
                    <h3>Improvement Suggestions:</h3>
                    <div id="suggestions"></div>
                    
                    <div id="subject-specific" style="display: none;">
                        <h3>Common <span id="subject-type-label">Subject</span> Issues:</h3>
                        <div id="common-issues"></div>
                        
                        <h3>Solutions:</h3>
                        <div id="common-solutions"></div>
                    </div>
                    
                    <h3>Recommended Next Steps:</h3>
                    <div id="next-steps"></div>
                </div>
            </div>
            
            <!-- Advanced Techniques Tab -->
            <div id="advanced-techniques" class="tab-content">
                <h2>Advanced Techniques</h2>
                <p>Learn advanced strategies for consistent, high-quality results</p>
                
                <div class="tabs">
                    <button class="tab-button active" data-technique="emphasis">Prompt Emphasis</button>
                    <button class="tab-button" data-technique="character">Character Consistency</button>
                    <button class="tab-button" data-technique="debugging">Prompt Debugging</button>
                    <button class="tab-button" data-technique="workflow">Workflow Optimization</button>
                </div>
                
                <div id="techniques-content">
                    <!-- Dynamically populated with technique cards -->
                </div>
            </div>
            
            <!-- Content Templates Tab -->
            <div id="content-templates" class="tab-content">
                <h2>Content-Specific Templates</h2>
                <p>Structured templates for different types of content</p>
                
                <div class="tabs">
                    <button class="tab-button active" data-template="portrait">Portrait</button>
                    <button class="tab-button" data-template="character">Character</button>
                    <button class="tab-button" data-template="landscape">Landscape</button>
                    <button class="tab-button" data-template="concept">Concept Art</button>
                </div>
                
                <div class="panel">
                    <h3>Template Structure:</h3>
                    <div id="template-structure"></div>
                    
                    <h3>Examples:</h3>
                    <div id="template-examples"></div>
                </div>
            </div>
            
            <!-- OpenArt AI Models Tab -->
            <div id="openart-models" class="tab-content">
                <h2>OpenArt AI Models</h2>
                <p>Learn about specialized OpenArt AI models and their optimal parameters</p>
                
                <div class="panel">
                    <h3>Juggernaut XL</h3>
                    <p>Advanced SDXL-based model fine-tuned on 15,000 recaptioned images, exceptional for photorealistic portraits.</p>
                    <ul>
                        <li><strong>Optimal Resolution:</strong> 832×1216 for portraits, works with any standard SDXL resolution</li>
                        <li><strong>Best Sampler:</strong> DPM++ 2M SDE with 30-40 steps and CFG scale 3-6</li>
                        <li><strong>Ideal Use Cases:</strong> Photorealistic portraits, detailed human subjects</li>
                        <li><strong>Prompting Style:</strong> Responds well to both keyword-style and natural language instructions</li>
                    </ul>
                </div>
                
                <div class="panel">
                    <h3>Flux Models</h3>
                    <p>OpenArt's proprietary models with different specialized capabilities:</p>
                    
                    <h4>Flux (Dev)</h4>
                    <ul>
                        <li><strong>Key Strengths:</strong> Realistic image generation with accurate text incorporation</li>
                        <li><strong>Best For:</strong> Mock-ups, product visualizations, content with text elements</li>
                        <li><strong>Optimal Steps:</strong> 28+ steps for complex images</li>
                        <li><strong>Versatility:</strong> Excels across diverse subjects from fantasy to architecture</li>
                    </ul>
                    
                    <h4>Flux (Pro)</h4>
                    <ul>
                        <li><strong>Enhanced Features:</strong> Improved detail rendering, consistency, and prompt adherence</li>
                        <li><strong>Ideal For:</strong> Professional applications requiring precision</li>
                    </ul>
                </div>
                
                <div class="panel">
                    <h3>Juggernaut Flux Pro</h3>
                    <p>Flagship collaboration model designed for photorealistic excellence:</p>
                    <ul>
                        <li><strong>Key Improvements:</strong> Superior sharpness, optimized contrast, improved focus, reduced artifacts</li>
                        <li><strong>Major Advantage:</strong> Elimination of "wax effect" for natural skin textures</li>
                        <li><strong>Resolution Support:</strong> Up to 1536×1536, handles unusual aspect ratios well</li>
                        <li><strong>Best For:</strong> Professional photorealistic imagery with natural textures</li>
                    </ul>
                </div>
                
                <div class="panel">
                    <h3>SDXL Film Photography Style</h3>
                    <p>LoRA component that adds authentic film photography aesthetics:</p>
                    <ul>
                        <li><strong>Application:</strong> Apply with 0.8 strength, works best with photorealistic base models</li>
                        <li><strong>Trigger Words:</strong> "film photography style," "light grain," "medium grain," "heavy grain"</li>
                        <li><strong>Technical Settings:</strong> DPM++ 2M Karras sampler with 30+ steps at 1024×1024</li>
                        <li><strong>Notes:</strong> PNG format recommended over JPG to preserve grain texture</li>
                    </ul>
                </div>
                
                <div class="panel">
                    <h3>Strategic Model Selection</h3>
                    <ul>
                        <li><strong>Portraits with Detail:</strong> Juggernaut XL</li>
                        <li><strong>Text Integration:</strong> Flux (Dev)</li>
                        <li><strong>Maximum Photorealism:</strong> Juggernaut Flux Pro</li>
                        <li><strong>Professional Use:</strong> Flux (Pro)</li>
                        <li><strong>Film Photography Look:</strong> SDXL Film Photography Style + Juggernaut XL</li>
                    </ul>
                </div>
            </div>
            
            <!-- ControlNet Guidance Tab -->
            <div id="controlnet-guidance" class="tab-content">
                <h2>ControlNet Guidance</h2>
                <p>Learn how to use ControlNet effectively with reference images</p>
                
                <div class="tabs">
                    <button class="tab-button active" data-controlnet="openPose">Open Pose</button>
                    <button class="tab-button" data-controlnet="kennyMode">Kenny Mode</button>
                    <button class="tab-button" data-controlnet="depthMode">Depth Mode</button>
                    <button class="tab-button" data-controlnet="lineArtMode">Line Art</button>
                    <button class="tab-button" data-controlnet="ipAdapterMode">IP Adapter</button>
                </div>
                
                <div class="panel">
                    <h3 id="controlnet-title">Mode Title</h3>
                    <p id="controlnet-description">Description of the ControlNet mode</p>
                    
                    <h4>Best For:</h4>
                    <ul id="controlnet-uses"></ul>
                    
                    <h4>Usage:</h4>
                    <p id="controlnet-usage"></p>
                </div>
            </div>
        </div>
    </div>
    
    <footer>
        <p>Enhanced Stable Diffusion Prompt Assistant &copy; 2025 | Based on OpenArt AI Knowledge Base</p>
    </footer>
    
    <script>
        // Main application JavaScript
        document.addEventListener('DOMContentLoaded', function() {
            // Tab navigation
            const tabLinks = document.querySelectorAll('#tools a');
            const tabContents = document.querySelectorAll('.main-content > div');
            
            tabLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const tab = this.getAttribute('data-tab');
                    
                    // Deactivate all tabs
                    tabLinks.forEach(l => l.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    // Activate selected tab
                    this.classList.add('active');
                    document.getElementById(tab).classList.add('active');
                });
            });
            
            // Model selection
            const modelButtons = document.querySelectorAll('.model-button');
            modelButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const container = this.closest('.model-selector');
                    container.querySelectorAll('.model-button').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Update model-specific info if on prompt builder tab
                    if (document.getElementById('prompt-builder').classList.contains('active')) {
                        const model = this.getAttribute('data-model');
                        const modelInfo = {
                            sdxl: "Less reliant on explicit quality terms, handles longer contexts better, more literal interpretation",
                            sd15: "Needs explicit quality enhancers, benefits from artist references, responds well to emphasis",
                            sd21: "Improved text generation, more literal interpretation of prompts",
                            juggernautxl: "Exceptional for photorealistic portraits, fine-tuned on 15,000 recaptioned images",
                            fluxdev: "Excels at realistic image generation and accurate text incorporation within images",
                            juggernautfluxpro: "Superior visual fidelity with enhanced sharpness, detail, contrast, and natural skin textures",
                            fluxpro: "Enhanced version optimized for professional use cases with improved detail rendering",
                            sdxlfilm: "LoRA that adds authentic film photography aesthetics with realistic film grain and color profiles"
                        };
                        document.getElementById('model-specific-info').innerHTML = `<p><strong>${model.toUpperCase()} Notes:</strong> ${modelInfo[model]}</p>`;
                    }
                    
                    // Update negative prompt model note if on negative prompts tab
                    if (document.getElementById('negative-prompts').classList.contains('active')) {
                        const model = this.getAttribute('data-model');
                        const negativeNotes = {
                            sdxl: "SDXL generally requires less extensive negative prompts than SD 1.5",
                            sd15: "SD 1.5 often needs detailed negative prompts to avoid anatomical issues",
                            sd21: "SD 2.1 benefits from style-focused negative prompts",
                            juggernautxl: "Handles most common issues well, but still benefits from negative prompts for hands and faces",
                            fluxdev: "Needs fewer anatomical negative prompts, but text-specific negatives can help with complex labels",
                            juggernautfluxpro: "Significantly better with skin textures and faces, requires minimal negative prompts",
                            fluxpro: "Improved handling of common artifacts, focus negative prompts on stylistic issues",
                            sdxlfilm: "Add 'digital looking, smooth skin, perfect' to negatives to enhance film effect authenticity"
                        };
                        document.getElementById('negative-model-note').textContent = negativeNotes[model];
                    }
                });
            });
            
            // Prompt Builder
            const buildPromptButton = document.getElementById('build-prompt');
            buildPromptButton.addEventListener('click', function() {
                const subject = document.getElementById('subject').value;
                const details = document.getElementById('details').value;
                const style = document.getElementById('style').value;
                const quality = document.getElementById('quality').value;
                const useEmphasis = document.getElementById('use-emphasis').checked;
                
                // Get selected model
                const modelButton = document.querySelector('#prompt-builder .model-selector .active');
                const model = modelButton.getAttribute('data-model');
                
                // Basic validation
                if (!subject) {
                    alert('Please enter a subject');
                    return;
                }
                
                // Simulate server request to build prompt
                // In a real implementation, this would call your API
                const options = { useWeighting: useEmphasis };
                simulateBuildPrompt(subject, details, style, quality, model, options);
            });
            
            function simulateBuildPrompt(subject, details, style, quality, model, options) {
                // Simulate prompt building with model-specific logic
                let processedSubject = subject;
                
                if (options.useWeighting && model === 'sd15') {
                    processedSubject = `(${subject})`;
                }
                
                let processedStyle = style;
                if (model === 'sd15' && !style.toLowerCase().includes('trending')) {
                    processedStyle = `${style}, trending on artstation`;
                }
                
                let processedQuality = quality;
                if (model === 'sd15' && !quality.toLowerCase().includes('detailed')) {
                    processedQuality = `highly detailed, ${quality}`;
                }
                
                // Build prompt
                const prompt = `${processedSubject}, ${details}, ${processedStyle}, ${processedQuality}`;
                
                // Estimate token count (simple approximation)
                const words = prompt.split(/\s+/).length;
                const tokenCount = Math.ceil(words * 1.3);
                
                // Display result
                document.getElementById('final-prompt').textContent = prompt;
                document.getElementById('prompt-result').style.display = 'block';
                
                // Update token counter with appropriate styling
                const tokenCounter = document.getElementById('token-counter');
                tokenCounter.textContent = `Estimated tokens: ${tokenCount}/75`;
                
                if (tokenCount <= 50) {
                    tokenCounter.className = 'token-count good';
                } else if (tokenCount <= 75) {
                    tokenCounter.className = 'token-count warn';
                } else {
                    tokenCounter.className = 'token-count error';
                }
                
                // Analyze prompt
                analyzePrompt(prompt, model);
            }
            
            function analyzePrompt(prompt, model) {
                const analysis = { suggestions: [] };
                
                // Simple analysis logic
                if (model === 'sd15' && !prompt.toLowerCase().includes('detailed')) {
                    analysis.suggestions.push("Add quality terms like 'highly detailed' for better results with SD 1.5");
                }
                
                if (!prompt.toLowerCase().includes('lighting')) {
                    analysis.suggestions.push("Consider specifying lighting type for better atmosphere");
                }
                
                // Display analysis results
                const analysisDiv = document.getElementById('prompt-analysis');
                if (analysis.suggestions.length > 0) {
                    let html = '<h4>Prompt Analysis:</h4><ul class="suggestions-list">';
                    analysis.suggestions.forEach(suggestion => {
                        html += `<li>${suggestion}</li>`;
                    });
                    html += '</ul>';
                    analysisDiv.innerHTML = html;
                } else {
                    analysisDiv.innerHTML = '<p>No issues detected in your prompt.</p>';
                }
            }
            
            // Copy buttons
            document.getElementById('copy-prompt').addEventListener('click', function() {
                const text = document.getElementById('final-prompt').textContent;
                navigator.clipboard.writeText(text).then(() => {
                    alert('Prompt copied to clipboard!');
                });
            });
            
            // Modifier tabs
            const modifierTabs = document.querySelectorAll('[data-modifier]');
            modifierTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const container = this.closest('.tabs');
                    container.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const category = this.getAttribute('data-modifier');
                    const model = document.querySelector('#prompt-builder .model-selector .active').getAttribute('data-model');
                    loadModifiers(category, model);
                });
            });
            
            function loadModifiers(category, model) {
                // Simulate loading modifiers - in real implementation, would call API
                const modifiers = {
                    quality: [
                        "4K, 8K, UHD, ultra high definition, ultra-sharp focus",
                        "Highly detailed, intricate details, professional photograph",
                        "Masterpiece, sharp focus, HDR, crystal clear"
                    ],
                    lighting: [
                        "Golden hour, sunset lighting, morning light, dappled sunlight",
                        "Studio lighting, professional lighting, soft-box lighting",
                        "Cinematic lighting, volumetric lighting, dramatic shadows"
                    ],
                    medium: [
                        "Oil painting, watercolor, acrylic, gouache",
                        "Pencil drawing, charcoal sketch, ink drawing, colored pencil",
                        "Digital art, digital painting, concept art"
                    ],
                    artists: [
                        "In the style of Van Gogh, inspired by Monet, like Rembrandt",
                        "Style of Greg Rutkowski, by Alphonse Mucha, like James Gurney",
                        "by H.R. Giger, inspired by Chesley Bonestell"
                    ],
                    film: [
                        "16mm film, 35mm Kodachrome, Super 8, Polaroid",
                        "1920s silent film, 1940s film noir, 1980s VHS aesthetic",
                        "Dolly shot, tracking shot, crane shot, Dutch angle"
                    ]
                };
                
                // Add model-specific modifiers
                if (category === 'artists' && model === 'sd15') {
                    modifiers.artists.unshift("Greg Rutkowski, Thomas Kinkade, Alphonse Mucha (Recommended for SD 1.5)");
                }
                
                if (category === 'quality' && model === 'sdxl') {
                    modifiers.quality.unshift("High fidelity, professional (Recommended for SDXL)");
                }
                
                let html = '<div class="grid">';
                modifiers[category].forEach(modifier => {
                    html += `
                        <div class="card">
                            <div>${modifier}</div>
                            <button class="copy-button" data-text="${modifier}">Copy</button>
                        </div>
                    `;
                });
                html += '</div>';
                
                document.getElementById('modifiers-content').innerHTML = html;
                
                // Add event listeners to copy buttons
                document.querySelectorAll('.copy-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const text = this.getAttribute('data-text');
                        navigator.clipboard.writeText(text).then(() => {
                            this.textContent = 'Copied!';
                            setTimeout(() => {
                                this.textContent = 'Copy';
                            }, 2000);
                        });
                    });
                });
            }
            
            // Load initial modifiers
            loadModifiers('quality', 'sdxl');
            
            // Advanced techniques tabs
            const techniqueTabs = document.querySelectorAll('[data-technique]');
            techniqueTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const container = this.closest('.tabs');
                    container.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const technique = this.getAttribute('data-technique');
                    loadTechniques(technique);
                });
            });
            
            function loadTechniques(technique) {
                // Simulate loading techniques - in real implementation, would call API
                const techniques = {
                    emphasis: [
                        {
                            name: "Parentheses emphasis",
                            description: "Using parentheses to increase the weight of terms",
                            implementation: "Place important terms in parentheses: (detailed face), (intricate details)",
                            example: "Portrait of a warrior, (strong jawline), (detailed armor), epic lighting"
                        },
                        {
                            name: "Token positioning",
                            description: "Placing important elements earlier in the prompt",
                            implementation: "Start with your most important subject or style elements",
                            example: "Detailed cyberpunk cityscape, neon lights, flying cars, nighttime, futuristic"
                        },
                        {
                            name: "Repetition",
                            description: "Repeating critical terms for increased influence",
                            implementation: "Important terms can be repeated: detailed, highly detailed",
                            example: "Fantasy landscape, detailed, highly detailed, mountains, castle, sunset"
                        }
                    ],
                    character: [
                        {
                            name: "Seed fixation",
                            description: "Using the same seed number with consistent prompts to maintain character identity",
                            implementation: "Save successful seed values and reuse them for the same character",
                            example: "Generate multiple images of the same character with seed 1234567"
                        },
                        {
                            name: "Prompt templating",
                            description: "Developing a consistent template for character descriptions",
                            implementation: "Create a standardized prompt structure that includes all identifying features",
                            example: "Character template: [Name], [age], [distinctive features], [clothing], [expression], [pose]"
                        },
                        {
                            name: "Img2img chaining",
                            description: "Using previous generations as input for new images",
                            implementation: "Use low strength values (0.3-0.5) to preserve character appearance while changing poses/scenes",
                            example: "Generate initial character, then use img2img at 0.4 strength to change pose while preserving appearance"
                        }
                    ],
                    debugging: [
                        {
                            name: "Element isolation",
                            description: "Testing prompt components individually to identify issues",
                            implementation: "Remove all but essential elements, then add back components one by one",
                            example: "Start with 'portrait of a woman' then add style, lighting, etc. one at a time"
                        },
                        {
                            name: "A/B testing",
                            description: "Making controlled, single changes between generations",
                            implementation: "Change only one aspect of your prompt at a time to isolate its effect",
                            example: "Generate with 'oil painting' then switch only that term to 'watercolor' to compare"
                        },
                        {
                            name: "Parameter variation",
                            description: "Testing different technical settings while keeping the prompt constant",
                            implementation: "Try different samplers, CFG values, and step counts with the same prompt and seed",
                            example: "Keep prompt and seed fixed, test CFG values of 7, 9, and 12 to see differences"
                        }
                                            console.error("Error saving prompt:", err);
                        showMainMenu();
                      });
                    });
                  } else {
                    showMainMenu();
                  }
                });
              });
            });
          });
        });
      });
    });
  }
  
  function getNegativePromptDialog() {
    console.log(promptAssistant.interface.negativePromptInstructions);
    
    // First get the model
    console.log("\nWhich model are you using?");
    console.log("1. Stable Diffusion XL (SDXL)");
    console.log("2. Stable Diffusion 1.5 (SD 1.5)");
    console.log("3. Stable Diffusion 2.1 (SD 2.1)");
    
    rl.question("\nSelect a model (1-3): ", (modelChoice) => {
      let model;
      switch(parseInt(modelChoice)) {
        case 1: model = "sdxl"; break;
        case 2: model = "sd15"; break;
        case 3: model = "sd21"; break;
        default: model = "sdxl";
      }
      
      console.log("\nUse cases:");
      console.log("1. General purpose");
      console.log("2. Portrait/Character");
      console.log("3. Landscape/Environment");
      console.log("4. Anime/Stylized");
      console.log("5. Photorealistic");
      
      rl.question("\nSelect a use case (1-5): ", (answer) => {
        const option = parseInt(answer);
        let useCase;
        
        switch(option) {
          case 1: useCase = "general"; break;
          case 2: useCase = "portrait"; break;
          case 3: useCase = "landscape"; break;
          case 4: useCase = "anime"; break;
          case 5: useCase = "realistic"; break;
          default: 
            console.log("Invalid option. Using general purpose.");
            useCase = "general";
        }
        
        const negativePrompt = promptAssistant.promptBuilder.recommendNegativePrompt(useCase, model);
        
        console.log("\nRecommended negative prompt:");
        console.log(negativePrompt);
        
        // Provide model-specific tips
        if (model === "sdxl") {
          console.log("\nSDXL tip: SDXL generally requires less extensive negative prompts than SD 1.5");
        } else if (model === "sd15") {
          console.log("\nSD 1.5 tip: Consider adding specific anatomical terms to negative prompts for better results");
        }
        
        rl.question("\nPress Enter to return to main menu...", () => {
          showMainMenu();
        });
      });
    });
  }
  
  function optimizeParametersDialog() {
    console.log(promptAssistant.interface.parameterGuidanceInstructions);
    
    // Model selection
    console.log("\nWhich model are you using?");
    console.log("1. Stable Diffusion XL (SDXL)");
    console.log("2. Stable Diffusion 1.5 (SD 1.5)");
    console.log("3. Stable Diffusion 2.1 (SD 2.1)");
    
    rl.question("\nSelect a model (1-3): ", (modelAnswer) => {
      let model;
      switch(parseInt(modelAnswer)) {
        case 1: model = "sdxl"; break;
        case 2: model = "sd15"; break;
        case 3: model = "sd21"; break;
        default: 
          console.log("Invalid option. Using SDXL.");
          model = "sdxl";
      }
      
      // Content type selection for specialized parameter sets
      console.log("\nWhat type of content are you generating?");
      console.log("1. Portrait/Character");
      console.log("2. Landscape/Environment");
      console.log("3. Concept Art");
      console.log("4. Anime Style");
      console.log("5. General Purpose");
      
      rl.question("\nSelect content type (1-5): ", (contentAnswer) => {
        let contentType;
        switch(parseInt(contentAnswer)) {
          case 1: contentType = "portrait"; break;
          case 2: contentType = "landscape"; break;
          case 3: contentType = "concept"; break;
          case 4: contentType = "anime"; break;
          default: contentType = "general"; break;
        }
        
        // Get optimized parameter set
        const paramSet = promptAssistant.parameterAdvisor.recommendParameterSet(contentType, model);
        
        // Display parameter recommendations
        console.log(`\nOptimized parameters for ${contentType} using ${promptAssistant.knowledgeBase.models[model].name}:`);
        console.log(`Description: ${paramSet.description}`);
        console.log(`Recommended CFG range: ${paramSet.cfg}`);
        console.log(`Recommended sampler: ${paramSet.sampler}`);
        console.log(`Recommended step count: ${paramSet.steps}`);
        console.log(`Recommended resolution: ${paramSet.width}x${paramSet.height}`);
        console.log(`Note: ${paramSet.notes}`);
        
        // Model-specific features
        if (model === "sdxl" && promptAssistant.knowledgeBase.models.sdxl.optimalSettings.refinement) {
          console.log("\nSDXL Refinement: Enabled");
          console.log(`Recommended refinement strength: ${promptAssistant.knowledgeBase.models.sdxl.optimalSettings.refinementRatio}`);
          console.log("Refinement improves details and coherence in the final image");
        }
        
        // Custom parameter guidance (optional)
        console.log("\nWould you like custom guidance for specific parameters?");
        console.log("1. CFG Scale");
        console.log("2. Step Count");
        console.log("3. Sampler Selection");
        console.log("4. Img2Img Strength");
        console.log("5. Return to main menu");
        
        rl.question("\nSelect parameter (1-5): ", (paramAnswer) => {
          const paramOption = parseInt(paramAnswer);
          
          if (paramOption === 5) {
            showMainMenu();
            return;
          }
          
          switch(paramOption) {
            case 1:
              console.log("\nCFG Scale Guidance:");
              console.log("- " + promptAssistant.parameterAdvisor.suggestCFG("creative", model));
              console.log("- " + promptAssistant.parameterAdvisor.suggestCFG("balanced", model));
              console.log("- " + promptAssistant.parameterAdvisor.suggestCFG("precise", model));
              break;
            case 2:
              console.log("\nStep Count Guidance:");
              console.log("- " + promptAssistant.parameterAdvisor.suggestSteps("draft", model));
              console.log("- " + promptAssistant.parameterAdvisor.suggestSteps("standard", model));
              console.log("- " + promptAssistant.parameterAdvisor.suggestSteps("high", model));
              break;
            case 3:
              console.log("\nSampler Selection Guidance:");
              console.log("- " + promptAssistant.parameterAdvisor.suggestSampler("speed", model));
              console.log("- " + promptAssistant.parameterAdvisor.suggestSampler("balanced", model));
              console.log("- " + promptAssistant.parameterAdvisor.suggestSampler("quality", model));
              console.log("- " + promptAssistant.parameterAdvisor.suggestSampler("technical", model));
              break;
            case 4:
              console.log("\nImg2Img Strength Guidance:");
              console.log("- " + promptAssistant.parameterAdvisor.suggestImg2ImgStrength("subtle", model));
              console.log("- " + promptAssistant.parameterAdvisor.suggestImg2ImgStrength("balanced", model));
              console.log("- " + promptAssistant.parameterAdvisor.suggestImg2ImgStrength("major", model));
              break;
            default:
              console.log("\nInvalid option.");
          }
          
          rl.question("\nPress Enter to return to main menu...", () => {
            showMainMenu();
          });
        });
      });
    });
  }
  
  function analyzeResultsDialog() {
    console.log(promptAssistant.interface.resultAnalysisInstructions);
    
    // First get the model used
    console.log("\nWhich model did you use?");
    console.log("1. Stable Diffusion XL (SDXL)");
    console.log("2. Stable Diffusion 1.5 (SD 1.5)");
    console.log("3. Stable Diffusion 2.1 (SD 2.1)");
    
    rl.question("\nSelect model (1-3): ", (modelAnswer) => {
      let model;
      switch(parseInt(modelAnswer)) {
        case 1: model = "sdxl"; break;
        case 2: model = "sd15"; break;
        case 3: model = "sd21"; break;
        default: model = "sdxl";
      }
      
      rl.question("\nEnter the prompt you used: ", (prompt) => {
        rl.question("Describe the results and any issues: ", (description) => {
          const suggestions = promptAssistant.imageAnalyzer.analyzeResults(prompt, description, model);
          
          console.log("\nImprovement suggestions:");
          suggestions.forEach((suggestion, index) => {
            console.log(`${index + 1}. ${suggestion}`);
          });
          
          // Check for subject-specific issues
          console.log("\nIs the image of a specific subject type?");
          console.log("1. Portrait/Person");
          console.log("2. Landscape/Environment");
          console.log("3. Character (fantasy, sci-fi, etc.)");
          console.log("4. None of the above");
          
          rl.question("\nSelect subject type (1-4): ", (subjectAnswer) => {
            let subjectType;
            switch(parseInt(subjectAnswer)) {
              case 1: subjectType = "portrait"; break;
              case 2: subjectType = "landscape"; break;
              case 3: subjectType = "character"; break;
              default: subjectType = null;
            }
            
            if (subjectType) {
              const commonProblems = promptAssistant.imageAnalyzer.analyzeCommonProblems(subjectType, model);
              
              console.log(`\nCommon ${subjectType} issues:`);
              commonProblems.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
              });
              
              console.log(`\nSolutions for ${subjectType} issues:`);
              commonProblems.solutions.forEach((solution, index) => {
                console.log(`${index + 1}. ${solution}`);
              });
            }
            
            console.log("\nRecommended next steps:");
            const nextSteps = promptAssistant.imageAnalyzer.recommendNextSteps(prompt, model);
            nextSteps.forEach((step, index) => {
              console.log(`${index + 1}. ${step}`);
            });
            
            rl.question("\nPress Enter to return to main menu...", () => {
              showMainMenu();
            });
          });
        });
      });
    });
  }
  
  function showAdvancedTechniquesDialog() {
    console.log("\nAdvanced Techniques:");
    console.log("1. Prompt Emphasis Techniques");
    console.log("2. Character Consistency Strategies");
    console.log("3. Prompt Debugging Methodologies");
    console.log("4. Specialized Workflow Strategies");
    console.log("5. Return to main menu");
    
    rl.question("\nSelect a technique (1-5): ", (answer) => {
      const option = parseInt(answer);
      
      switch(option) {
        case 1:
          showPromptEmphasisTechniques();
          break;
        case 2:
          showCharacterConsistencyTechniques();
          break;
        case 3:
          showPromptDebuggingTechniques();
          break;
        case 4:
          showWorkflowOptimizationTechniques();
          break;
        case 5:
          showMainMenu();
          break;
        default:
          console.log("Invalid option. Please try again.");
          showAdvancedTechniquesDialog();
      }
    });
  }
  
  function showPromptEmphasisTechniques() {
    const techniques = promptAssistant.knowledgeBase.advancedTechniques.promptEmphasis;
    
    console.log(`\n${techniques.title}:`);
    techniques.techniques.forEach((technique, index) => {
      console.log(`\n${index + 1}. ${technique.name}`);
      console.log(`   ${technique.description}`);
      console.log(`   Implementation: ${technique.implementation}`);
      console.log(`   Example: ${technique.example}`);
    });
    
    // Model-specific notes
    console.log("\nModel-specific notes:");
    console.log("- SDXL: Responds better to clear descriptions rather than special formatting");
    console.log("- SD 1.5: Benefits significantly from emphasis techniques, especially parentheses");
    
    rl.question("\nPress Enter to return to advanced techniques...", () => {
      showAdvancedTechniquesDialog();
    });
  }
  
  function showCharacterConsistencyTechniques() {
    const techniques = promptAssistant.knowledgeBase.advancedTechniques.characterConsistency;
    
    console.log(`\n${techniques.title}:`);
    techniques.techniques.forEach((technique, index) => {
      console.log(`\n${index + 1}. ${technique.name}`);
      console.log(`   ${technique.description}`);
      console.log(`   Implementation: ${technique.implementation}`);
      console.log(`   Example: ${technique.example}`);
    });
    
    rl.question("\nPress Enter to return to advanced techniques...", () => {
      showAdvancedTechniquesDialog();
    });
  }
  
  function showPromptDebuggingTechniques() {
    const techniques = promptAssistant.knowledgeBase.advancedTechniques.promptDebugging;
    
    console.log(`\n${techniques.title}:`);
    techniques.techniques.forEach((technique, index) => {
      console.log(`\n${index + 1}. ${technique.name}`);
      console.log(`   ${technique.description}`);
      console.log(`   Implementation: ${technique.implementation}`);
      console.log(`   Example: ${technique.example}`);
    });
    
    rl.question("\nPress Enter to return to advanced techniques...", () => {
      showAdvancedTechniquesDialog();
    });
  }
  
  function showWorkflowOptimizationTechniques() {
    const techniques = promptAssistant.knowledgeBase.advancedTechniques.workflowOptimization;
    
    console.log(`\n${techniques.title}:`);
    techniques.techniques.forEach((technique, index) => {
      console.log(`\n${index + 1}. ${technique.name}`);
      console.log(`   ${technique.description}`);
      console.log(`   Implementation: ${technique.implementation}`);
      console.log(`   Example: ${technique.example}`);
    });
    
    rl.question("\nPress Enter to return to advanced techniques...", () => {
      showAdvancedTechniquesDialog();
    });
  }
  
  function showContentTemplatesDialog() {
    console.log(promptAssistant.interface.contentTemplateInstructions);
    
    console.log("\nContent types:");
    console.log("1. Portrait");
    console.log("2. Character");
    console.log("3. Landscape");
    console.log("4. Concept Art");
    console.log("5. Return to main menu");
    
    rl.question("\nSelect a content type (1-5): ", (answer) => {
      const option = parseInt(answer);
      
      if (option === 5) {
        showMainMenu();
        return;
      }
      
      let contentType;
      switch(option) {
        case 1: contentType = "portrait"; break;
        case 2: contentType = "character"; break;
        case 3: contentType = "landscape"; break;
        case 4: contentType = "concept"; break;
        default:
          console.log("Invalid option. Please try again.");
          showContentTemplatesDialog();
          return;
      }
      
      const template = promptAssistant.promptBuilder.recommendTemplate(contentType);
      
      if (template) {
        console.log(`\n${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Template:`);
        console.log(template.template);
        
        console.log("\nExamples:");
        template.examples.forEach((example, index) => {
          console.log(`\n${index + 1}. ${example}`);
        });
      } else {
        console.log(`\nNo template found for ${contentType}.`);
      }
      
      rl.question("\nPress Enter to return to content templates...", () => {
        showContentTemplatesDialog();
      });
    });
  }
  
  function showControlNetGuidanceDialog() {
    console.log(promptAssistant.interface.controlNetGuidanceInstructions);
    
    console.log("\nControlNet modes:");
    console.log("1. Open Pose (for human poses)");
    console.log("2. Kenny Mode (edge detection)");
    console.log("3. Depth Mode (spatial relationships)");
    console.log("4. Line Art Mode (detailed drawings)");
    console.log("5. IP Adapter Mode (style transfer)");
    console.log("6. Return to main menu");
    
    rl.question("\nSelect a mode (1-6): ", (answer) => {
      const option = parseInt(answer);
      
      if (option === 6) {
        showMainMenu();
        return;
      }
      
      let modeKey;
      switch(option) {
        case 1: modeKey = "openPose"; break;
        case 2: modeKey = "kennyMode"; break;
        case 3: modeKey = "depthMode"; break;
        case 4: modeKey = "lineArtMode"; break;
        case 5: modeKey = "ipAdapterMode"; break;
        default:
          console.log("Invalid option. Please try again.");
          showControlNetGuidanceDialog();
          return;
      }
      
      const mode = promptAssistant.knowledgeBase.controlNetModes[modeKey];
      
      console.log(`\n${mode.title}:`);
      console.log(mode.description);
      console.log("\nBest for:");
      mode.bestFor.forEach((use, index) => {
        console.log(`- ${use}`);
      });
      console.log(`\nUsage: ${mode.usage}`);
      
      rl.question("\nPress Enter to return to ControlNet guidance...", () => {
        showControlNetGuidanceDialog();
      });
    });
  }
  
  // Start the application
  showMainMenu();
}

// Example implementation of a web interface with Express
function setupExpressServer() {
  const express = require('express');
  const app = express();
  const port = 3000;
  
  // Middleware for parsing JSON and urlencoded form data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve static files
  app.use(express.static('public'));
  
  // Serve the web interface
  app.get('/', (req, res) => {
    res.send(webInterfaceHTML);
  });
  
  // API endpoint for building a prompt
  app.post('/api/build-prompt', (req, res) => {
    const { subject, details, style, quality, model = 'sdxl', options = {} } = req.body;
    const promptResult = promptAssistant.promptBuilder.buildStructuredPrompt(
      subject, details, style, quality, model, options
    );
    res.json({ 
      prompt: promptResult.prompt,
      tokenCount: promptResult.tokenCount,
      isWithinLimit: promptResult.isWithinLimit
    });
  });
  
  // API endpoint for analyzing a prompt
  app.post('/api/analyze-prompt', (req, res) => {
    const { prompt, model = 'sdxl' } = req.body;
    const analysis = promptAssistant.promptBuilder.analyzePrompt(prompt, model);
    res.json(analysis);
  });
  
  // API endpoint for getting negative prompts
  app.get('/api/negative-prompt/:useCase/:model', (req, res) => {
    const { useCase, model } = req.params;
    const negativePrompt = promptAssistant.promptBuilder.recommendNegativePrompt(useCase, model);
    res.json({ negativePrompt });
  });
  
  // API endpoint for optimizing parameters
  app.get('/api/parameters/:model/:scenario', (req, res) => {
    const { model, scenario } = req.params;
    const paramSet = promptAssistant.parameterAdvisor.recommendParameterSet(scenario, model);
    res.json(paramSet);
  });
  
  // API endpoint for specific parameter recommendations
  app.get('/api/parameter/:type/:setting/:model', (req, res) => {
    const { type, setting, model } = req.params;
    let recommendation;
    
    switch(type) {
      case 'cfg':
        recommendation = promptAssistant.parameterAdvisor.suggestCFG(setting, model);
        break;
      case 'steps':
        recommendation = promptAssistant.parameterAdvisor.suggestSteps(setting, model);
        break;
      case 'sampler':
        recommendation = promptAssistant.parameterAdvisor.suggestSampler(setting, model);
        break;
      case 'strength':
        recommendation = promptAssistant.parameterAdvisor.suggestImg2ImgStrength(setting, model);
        break;
      default:
        recommendation = "Unknown parameter type";
    }
    
    res.json({ recommendation });
  });
  
  // API endpoint for analyzing results
  app.post('/api/analyze', (req, res) => {
    const { prompt, description, model = 'sdxl' } = req.body;
    const suggestions = promptAssistant.imageAnalyzer.analyzeResults(prompt, description, model);
    const nextSteps = promptAssistant.imageAnalyzer.recommendNextSteps(prompt, model);
    res.json({ suggestions, nextSteps });
  });
  
  // API endpoint for common problems
  app.get('/api/common-problems/:subject/:model', (req, res) => {
    const { subject, model } = req.params;
    const problems = promptAssistant.imageAnalyzer.analyzeCommonProblems(subject, model);
    res.json(problems);
  });
  
  // API endpoint for getting content templates
  app.get('/api/template/:contentType', (req, res) => {
    const { contentType } = req.params;
    const template = promptAssistant.promptBuilder.recommendTemplate(contentType);
    res.json(template || { error: "Template not found" });
  });
  
  // API endpoint for getting modifier suggestions
  app.get('/api/modifiers/:category/:model', (req, res) => {
    const { category, model } = req.params;
    const count = req.query.count || 5;
    const modifiers = promptAssistant.promptBuilder.suggestModifiers(category, count, model);
    res.json({ modifiers });
  });
  
  // API endpoint for getting controlnet modes
  app.get('/api/controlnet/:mode', (req, res) => {
    const { mode } = req.params;
    const controlNetMode = promptAssistant.knowledgeBase.controlNetModes[mode];
    res.json(controlNetMode || { error: "ControlNet mode not found" });
  });
  
  // API endpoint for saving prompts
  app.post('/api/save-prompt', async (req, res) => {
    const { prompt, filename, metadata = {} } = req.body;
    try {
      const result = await promptAssistant.fileOperations.savePrompt(prompt, filename, metadata);
      res.json({ success: true, message: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  // API endpoint for listing saved prompts
  app.get('/api/saved-prompts', async (req, res) => {
    try {
      const prompts = await promptAssistant.fileOperations.listSavedPrompts();
      res.json({ prompts });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // API endpoint for loading a saved prompt
  app.get('/api/prompt/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
      const promptData = await promptAssistant.fileOperations.loadPrompt(filename);
      res.json({ promptData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // API endpoint for exporting prompts
  app.post('/api/export', async (req, res) => {
    const { format, promptIds } = req.body;
    try {
      const exportPath = await promptAssistant.fileOperations.exportPrompts(format, promptIds);
      res.json({ success: true, path: exportPath });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Stable Diffusion Prompt Assistant web interface running at http://localhost:${port}`);
  });
}

// Include the HTML template for the web interface
const webInterfaceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Stable Diffusion Prompt Assistant</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        h1, h2, h3 {
            color: #2c3e50;
        }
        
        header h1 {
            color: white;
            margin: 0;
        }
        
        .container {
            display: flex;
            gap: 20px;
        }
        
        .sidebar {
            flex: 1;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .main-content {
            flex: 3;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .panel {
            margin-bottom: 20px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #2c3e50;
        }
        
        .model-info {
            background-color: #e6f2ff;
            padding: 10px 15px;
            border-radius: 6px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
        }
        
        .warning {
            background-color: #fff9e6;
            padding: 10px 15px;
            border-radius: 6px;
            margin: 10px 0;
            border-left: 4px solid #f39c12;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        input[type="text"], 
        textarea,
        select {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 16px;
        }
        
        textarea {
            min-height: 120px;
            resize: vertical;
        }
        
        button {
            background-color: #2c3e50;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        
        button:hover {
            background-color: #1a252f;
        }
        
        button.secondary {
            background-color: #95a5a6;
        }
        
        button.secondary:hover {
            background-color: #7f8c8d;
        }
        
        .result {
            background-color: #e8f4f8;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            white-space: pre-wrap;
            font-family: monospace;
            border-left: 4px solid #3498db;
        }
        
        .token-count {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            margin-top: 10px;
            font-size: 14px;
        }
        
        .token-count.good {
            background-color: #d4edda;
            color: #155724;
        }
        
        .token-count.warn {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .token-count.error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap// Stable Diffusion Prompt Assistant
// Local directory: /Users/cpconnor/Desktop/VSC Scripts/StableDiffusionPromptAssistant

/**
 * This file implements an enhanced Stable Diffusion Prompt Assistant
 * based on the OpenArt AI knowledge base. It provides structured guidance
 * for creating effective prompts, managing parameters, and improving results.
 * 
 * @version 2.0.0
 * @author OpenArt AI Team
 */

// Import necessary libraries
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const readline = require('readline');
const util = require('util');

// Define core data structures
const promptAssistant = {
  // Knowledge base components
  knowledgeBase: {
    // Model variants with optimal settings
    models: {
      sdxl: {
        name: "Stable Diffusion XL",
        description: "Higher resolution (1024x1024), better composition and proportions",
        bestFor: ["Photorealism", "Complex compositions", "Accurate proportions", "Commercial quality"],
        promptNotes: "Less reliant on explicit quality terms, handles longer contexts better, more literal interpretation",
        optimalSettings: {
          cfgRange: [7, 9],
          recommendedSampler: "DPM++ 2M Karras",
          stepCount: [30, 50],
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          refinement: true,
          refinementRatio: 0.2
        }
      },
      sd15: {
        name: "Stable Diffusion 1.5",
        description: "Faster processing, more artistic styling",
        bestFor: ["Rapid prototyping", "Artistic styles", "Anime/illustration", "Stylized artwork"],
        promptNotes: "Needs explicit quality enhancers, benefits from artist references, responds well to emphasis",
        optimalSettings: {
          cfgRange: [7, 11],
          recommendedSampler: "Euler A",
          stepCount: [20, 40],
          aspectRatios: ["1:1", "4:3", "3:4"],
          refinement: false
        }
      },
      sd21: {
        name: "Stable Diffusion 2.1",
        description: "Better at following complex instructions",
        bestFor: ["Text rendering", "Complex scenes", "Following detailed instructions"],
        promptNotes: "Improved text generation, more literal interpretation of prompts",
        optimalSettings: {
          cfgRange: [7, 10],
          recommendedSampler: "DPM++ 2M Karras",
          stepCount: [30, 50],
          aspectRatios: ["1:1", "4:3", "3:4"],
          refinement: false
        }
      }
    },

    // Sampler recommendations
    samplers: {
      "DDIM": {
        description: "Fast and efficient, especially for low step counts (20-30)",
        bestFor: ["Quick results", "When details aren't critical", "Rapid iteration"],
        tradeoffs: "Sacrifices some detail quality for speed"
      },
      "Euler a": {
        description: "Good balance for most use cases with decent quality and speed",
        bestFor: ["General purpose", "Artistic styles", "Balanced approach"],
        tradeoffs: "Jack of all trades but master of none"
      },
      "DPM++ 2M Karras": {
        description: "High-quality, realistic rendering but takes longer",
        bestFor: ["Final pieces", "Photorealism", "Detailed renders", "Portraits"],
        tradeoffs: "Slower processing but higher quality"
      },
      "UniPC": {
        description: "Excels at color accuracy and sharp details",
        bestFor: ["Complex scenes", "Architecture", "Technical illustrations"],
        tradeoffs: "Specialized for certain content types"
      }
    },

    // Parameter guidance
    parameters: {
      cfg: {
        description: "Controls how closely the AI follows your text prompt",
        ranges: {
          low: {
            range: [2, 6],
            effect: "Gives the AI more creative freedom. Images may be beautiful but might not closely match your prompt."
          },
          medium: {
            range: [7, 10],
            effect: "Provides a balanced approach, generally recommended for most use cases."
          },
          high: {
            range: [11, 15],
            effect: "Forces the AI to strictly follow your prompt but may introduce unnatural artifacts or overly saturated colors."
          }
        },
        recommendation: "Start with 7-9 for most cases. Increase if the image isn't following your prompt closely enough."
      },
      
      steps: {
        description: "Controls the denoising process depth",
        ranges: {
          low: {
            range: [20, 30],
            effect: "Faster generation but less refined details"
          },
          medium: {
            range: [30, 50],
            effect: "Good balance of quality and speed"
          },
          high: {
            range: [50, 100],
            effect: "Maximum detail but much slower processing"
          }
        },
        recommendation: "30-40 steps works well for most cases. Increase for final high-quality images."
      },
      
      seed: {
        description: "A numerical value that ensures reproducibility",
        usage: "Using the same seed value with the same prompt and settings will produce identical or very similar images",
        applications: [
          "Character consistency across multiple images",
          "Testing prompt variations while keeping the basic composition",
          "Finding and saving good seeds for future use"
        ],
        recommendation: "Leave as random (-1) for exploration, save and reuse good seeds for consistency"
      },
      
      strength: {
        description: "Controls how much of the original image is preserved in img2img",
        ranges: {
          low: {
            range: [0.2, 0.4],
            effect: "Subtle changes to original image, preserving most details"
          },
          medium: {
            range: [0.5, 0.7],
            effect: "Balanced transformation, keeps composition but allows significant changes"
          },
          high: {
            range: [0.8, 0.95],
            effect: "Almost complete regeneration, using original as loose inspiration"
          }
        },
        recommendation: "Start with 0.5-0.6 for balanced transformations"
      }
    },

    // Comprehensive modifier categories
    modifiers: {
      quality: {
        title: "Quality Enhancers",
        description: "Terms that improve overall quality and definition",
        examples: [
          "4K, 8K, UHD, ultra high definition, ultra-sharp focus",
          "Highly detailed, intricate details, professional photograph",
          "Masterpiece, sharp focus, HDR, crystal clear"
        ],
        modelSpecific: {
          "sdxl": ["High fidelity", "professional"],
          "sd15": ["UHD, 8K, ultra realistic", "intricate details"]
        }
      },
      
      lighting: {
        title: "Lighting Enhancers",
        description: "Terms that affect how light appears in your image",
        examples: [
          "Golden hour, sunset lighting, morning light, dappled sunlight",
          "Studio lighting, professional lighting, soft-box lighting",
          "Cinematic lighting, volumetric lighting, dramatic shadows",
          "God rays, lens flare, backlit, rim lighting"
        ]
      },
      
      medium: {
        title: "Art Medium Specifications",
        description: "Determines what artistic medium your image appears to be created with",
        examples: [
          "Oil painting, watercolor, acrylic, gouache",
          "Pencil drawing, charcoal sketch, ink drawing, colored pencil",
          "Digital art, digital painting, concept art",
          "Chalk art, graffiti, wood carving, sculpture, mosaic"
        ]
      },
      
      photography: {
        title: "Photography Modifiers",
        description: "Terms that apply photography-specific qualities",
        examples: [
          "Close-up, extreme close-up, medium shot, wide shot, aerial view",
          "Polaroid, monochrome, tilt-shift, long exposure, macro photography",
          "Shallow depth of field, bokeh, f/1.8, telephoto lens",
          "Shot on Nikon Z FX, Canon EOS R3, GoPro, drone photography"
        ]
      },
      
      illustration: {
        title: "Illustration Styles",
        description: "Terms that define specific illustration approaches",
        examples: [
          "3D render, Pixar-style, Unreal Engine, Blender, ray-tracing",
          "Vector illustration, flat design, cartoon, cel-shaded",
          "Comic book, manga style, graphic novel, retro comic",
          "Scientific illustration, technical drawing, blueprint",
          "Fantasy illustration, DnD map, hand-drawn map"
        ],
        modelSpecific: {
          "sd15": ["Anime style", "cel shading", "concept art"],
          "sdxl": ["3D render", "Unreal Engine", "Octane render"]
        }
      },
      
      artists: {
        title: "Artist References",
        description: "Referencing specific artists to influence style",
        examples: [
          "In the style of Van Gogh, inspired by Monet, like Rembrandt",
          "Style of Greg Rutkowski, by Alphonse Mucha, like James Gurney",
          "by Derek Gores, inspired by Miles Aldridge",
          "in the style of Andreas Achenbach, like Cuno Amiet",
          "by H.R. Giger, inspired by Chesley Bonestell"
        ],
        modelSpecific: {
          "sd15": ["Greg Rutkowski", "Thomas Kinkade", "Alphonse Mucha"],
          "sdxl": ["Varied artist influences", "multiple artist fusion"]
        }
      },
      
      emotion: {
        title: "Emotional Qualifiers",
        description: "Terms that infuse your image with specific emotional tones",
        examples: [
          "Joyful, hopeful, peaceful, romantic, energetic",
          "Grim, melancholic, tense, mysterious, foreboding",
          "Dreamy, nostalgic, ethereal, surreal, mystical"
        ]
      },
      
      aesthetic: {
        title: "Aesthetic Qualifiers",
        description: "Terms that apply specific visual aesthetics",
        examples: [
          "Vaporwave, cyberpunk, synthwave, afrofuturism",
          "Retro, 80s, vintage, art deco, victorian",
          "Steampunk, dieselpunk, gothcore, dark academia",
          "Surrealism, impressionism, cubism, minimalism"
        ]
      },
      
      film: {
        title: "Film and Camera Techniques",
        description: "Terms that apply cinematic qualities",
        examples: [
          "16mm film, 35mm Kodachrome, Super 8, Polaroid",
          "1920s silent film, 1940s film noir, 1980s VHS aesthetic",
          "Dolly shot, tracking shot, crane shot, Dutch angle",
          "Low angle shot, bird's eye view, over-the-shoulder"
        ]
      }
    },
    
    // Negative prompt templates by use case
    negativePrompts: {
      general: "ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur, distorted face",
      portrait: "blurry, bad anatomy, bad hands, extra fingers, missing fingers, extra limbs, deformed, disfigured, poorly drawn face, mutation, mutated, floating limbs, disconnected limbs, extra arms, extra hands, mangled, malformed hands, long neck, text, watermark, signature",
      landscape: "blurry, bad anatomy, bad perspective, low resolution, skewed horizon, poor composition, distorted perspective, unrealistic scale, watermark, signature, text, ugly, tiling, out of frame",
      anime: "bad anatomy, bad hands, extra digits, fewer digits, extra limbs, missing limbs, disconnected limbs, malformed hands, blurry, mutated, disfigured, poorly drawn, duplicate, extra fingers, mutated hands, mutation, deformed, cross-eyed",
      realistic: "cartoon, anime, illustration, painting, drawing, art, unrealistic, unnatural colors, surreal, fantasy, artificial, synthetic, digital art, amateur, unprofessional, text, watermark, logo, signature"
    },

    // Model-specific negative prompts
    modelSpecificNegativePrompts: {
      "sdxl": {
        general: "ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, bad art, beginner, amateur",
        portrait: "blurry, bad anatomy, bad hands, extra fingers, missing fingers, extra limbs, deformed, disfigured, poorly drawn face, mutation, mutated, disconnected limbs, malformed hands, long neck, text, watermark"
      },
      "sd15": {
        general: "ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra fingers, extra arms, disfigured, deformed, body out of frame, blurry, bad art, bad anatomy, watermark, signature, cut off",
        portrait: "bad hands, cropped head, out of frame, extra fingers, mutated hands, mutation, deformed face, blurry, bad anatomy, disfigured, poorly drawn face, cloned face, extra face, close up"
      }
    },
    
    // ControlNet guidance
    controlNetModes: {
      openPose: {
        title: "Open Pose",
        description: "Extracts a person's pose from an input image, allowing you to create new images with figures in the same position.",
        bestFor: ["Character poses", "Maintaining consistent body positions", "Human figures"],
        usage: "Upload a reference image with the desired pose, then describe the character/person you want to generate in that pose."
      },
      kennyMode: {
        title: "Kenny Mode (Edge Detection)",
        description: "Extracts edges from an image to influence the structure of a new creation. This is the default mode and works well for basic structural guidance.",
        bestFor: ["General structure guidance", "Object placement", "Scene layouts"],
        usage: "Upload a reference image with the desired structure, then describe the style and details you want in your new image."
      },
      depthMode: {
        title: "Depth Mode",
        description: "Detects the depth information in an image, creating more photorealistic results by preserving spatial relationships.",
        bestFor: ["Realistic scenes", "3D space preservation", "Maintaining perspective"],
        usage: "Upload a reference image with the desired depth and spatial arrangement, then describe the style and details for your new image."
      },
      lineArtMode: {
        title: "Line Art Mode",
        description: "Provides detailed edge detection, particularly useful for anime-style or intricate drawings.",
        bestFor: ["Anime/manga style", "Illustrations", "Sketches to finished art"],
        usage: "Upload a line drawing or sketch, then describe the colors, style, and details you want in the finished piece."
      },
      ipAdapterMode: {
        title: "IP Adapter Mode",
        description: "Applied style influence rather than structural guidance, allowing you to transfer the aesthetic feel from one image to another.",
        bestFor: ["Style transfer", "Consistent aesthetics", "Visual theme matching"],
        usage: "Upload a reference image with the desired style, then describe the content you want in that style."
      }
    },
    
    // Advanced techniques
    advancedTechniques: {
      promptEmphasis: {
        title: "Prompt Emphasis Techniques",
        description: "Methods to emphasize certain elements in your prompt for greater influence",
        techniques: [
          {
            name: "Parentheses emphasis",
            description: "Using parentheses to increase the weight of terms",
            implementation: "Place important terms in parentheses: (detailed face), (intricate details)",
            example: "Portrait of a warrior, (strong jawline), (detailed armor), epic lighting"
          },
          {
            name: "Token positioning",
            description: "Placing important elements earlier in the prompt",
            implementation: "Start with your most important subject or style elements",
            example: "Detailed cyberpunk cityscape, neon lights, flying cars, nighttime, futuristic"
          },
          {
            name: "Repetition",
            description: "Repeating critical terms for increased influence",
            implementation: "Important terms can be repeated: detailed, highly detailed",
            example: "Fantasy landscape, detailed, highly detailed, mountains, castle, sunset"
          }
        ]
      },
      characterConsistency: {
        title: "Character Consistency Strategies",
        techniques: [
          {
            name: "Seed fixation",
            description: "Using the same seed number with consistent prompts to maintain character identity",
            implementation: "Save successful seed values and reuse them for the same character",
            example: "Generate multiple images of the same character with seed 1234567"
          },
          {
            name: "Prompt templating",
            description: "Developing a consistent template for character descriptions",
            implementation: "Create a standardized prompt structure that includes all identifying features",
            example: "Character template: [Name], [age], [distinctive features], [clothing], [expression], [pose]"
          },
          {
            name: "Img2img chaining",
            description: "Using previous generations as input for new images",
            implementation: "Use low strength values (0.3-0.5) to preserve character appearance while changing poses/scenes",
            example: "Generate initial character, then use img2img at 0.4 strength to change pose while preserving appearance"
          }
        ]
      },
      
      promptDebugging: {
        title: "Prompt Debugging Strategies",
        techniques: [
          {
            name: "Element isolation",
            description: "Testing prompt components individually to identify issues",
            implementation: "Remove all but essential elements, then add back components one by one",
            example: "Start with 'portrait of a woman' then add style, lighting, etc. one at a time"
          },
          {
            name: "A/B testing",
            description: "Making controlled, single changes between generations",
            implementation: "Change only one aspect of your prompt at a time to isolate its effect",
            example: "Generate with 'oil painting' then switch only that term to 'watercolor' to compare"
          },
          {
            name: "Parameter variation",
            description: "Testing different technical settings while keeping the prompt constant",
            implementation: "Try different samplers, CFG values, and step counts with the same prompt and seed",
            example: "Keep prompt and seed fixed, test CFG values of 7, 9, and 12 to see differences"
          }
        ]
      },
      
      workflowOptimization: {
        title: "Specialized Workflow Strategies",
        techniques: [
          {
            name: "Two-stage refinement",
            description: "Generate basic concept then refine with img2img",
            implementation: "Create initial image at lower resolution/quality, then refine with img2img at medium strength",
            example: "Generate 512x512 concept, then use as reference for 1024x1024 with 0.5 strength"
          },
          {
            name: "Targeted inpainting",
            description: "Using inpainting to fix specific problem areas",
            implementation: "Generate full image, then mask and inpaint just problematic areas with focused prompts",
            example: "Mask hands in a portrait and inpaint with 'perfect hands, detailed fingers, anatomically correct'"
          },
          {
            name: "Style-content separation",
            description: "Develop content and style separately before combining",
            implementation: "Create structure with neutral style, then apply artistic style with img2img",
            example: "Generate realistic scene first, then transform to watercolor with img2img at 0.7 strength"
          }
        ]
      }
    },

    // Templates for specific content types
    contentTemplates: {
      portrait: {
        template: "[gender], [age], [distinctive features], [emotion/expression], [clothing], [lighting], [background], [style], [quality]",
        examples: [
          "Young woman with freckles, serene expression, wearing casual summer dress, soft natural lighting, blurred forest background, digital painting, highly detailed",
          "Elderly man with weathered face, determined expression, wearing formal suit, dramatic side lighting, dark gradient background, oil painting style, 4K resolution"
        ]
      },
      character: {
        template: "[character type], [distinctive features], [attire/equipment], [pose/action], [expression], [setting/background], [lighting], [style], [quality]",
        examples: [
          "Cyberpunk mercenary with neon blue mohawk, wearing high-tech armor, crouching on rooftop, focused expression, futuristic cityscape background, blue and purple neon lighting, digital art, highly detailed",
          "Fantasy wizard with long white beard, ornate magical robes, casting spell, intense expression, ancient library setting, magical glow lighting, oil painting style, 8K resolution"
        ]
      },
      landscape: {
        template: "[location/environment type], [time of day], [weather/atmosphere], [distinctive features], [foreground elements], [middle ground], [background elements], [lighting], [style], [quality]",
        examples: [
          "Tropical beach at sunset, clear sky with few clouds, white sand, palm trees in foreground, small wooden boats in water, mountains in distance, golden hour lighting, digital painting, highly detailed",
          "Snowy mountain range at dawn, misty atmosphere, pine forest in foreground, frozen lake in middle, towering peaks in background, soft morning lighting, watercolor style, 8K resolution"
        ]
      },
      concept: {
        template: "[concept type], [distinctive features], [materials/textures], [environment/context], [lighting], [perspective/angle], [style], [quality]",
        examples: [
          "Futuristic vehicle concept, sleek aerodynamic design, carbon fiber and chrome materials, hovering above neon-lit street, dramatic underlighting, 3/4 view, 3D render, highly detailed",
          "Fantasy weapon design, ornate crystal sword, engraved metal hilt with glowing runes, displayed on velvet cloth, museum lighting, straight-on perspective, digital illustration, 4K resolution"
        ]
      }
    }
  },
  
  // Functional components for the assistant
  promptBuilder: {
    /**
     * Builds a structured prompt with advanced formatting
     * @param {string} subject - Main subject of the image
     * @param {string} details - Details and modifiers
     * @param {string} style - Art style and medium
     * @param {string} quality - Technical quality specifications
     * @param {string} model - The model being used (sdxl, sd15, etc.)
     * @param {Object} options - Additional options for prompt building
     * @returns {string} Formatted prompt
     */
    buildStructuredPrompt: function(subject, details, style, quality, model = 'sdxl', options = {}) {
      // Default options
      const defaults = {
        emphasizeSubject: true,
        useWeighting: true,
        addModelSpecifics: true
      };
      
      // Merge options
      const settings = {...defaults, ...options};
      
      // Process subject according to model and settings
      let processedSubject = subject;
      if (settings.emphasizeSubject) {
        if (model === 'sd15' && settings.useWeighting) {
          processedSubject = `(${subject})`;
        } else if (model === 'sdxl') {
          // SDXL responds better to detailed descriptions than parenthetical emphasis
          processedSubject = subject;
        }
      }
      
      // Process style according to model
      let processedStyle = style;
      if (settings.addModelSpecifics && model === 'sd15') {
        // SD 1.5 often benefits from stronger style guidance
        if (!style.toLowerCase().includes('trending') && settings.useWeighting) {
          processedStyle = `${style}, trending on artstation`;
        }
      }
      
      // Process quality according to model
      let processedQuality = quality;
      if (settings.addModelSpecifics) {
        if (model === 'sd15' && !quality.toLowerCase().includes('detailed')) {
          processedQuality = `highly detailed, ${quality}`;
        } else if (model === 'sdxl' && quality.toLowerCase().includes('8k')) {
          // SDXL already has high resolution, so we might want to use different quality terms
          processedQuality = quality.replace('8K', 'high fidelity');
        }
      }
      
      // Assemble the final prompt
      const prompt = `${processedSubject}, ${details}, ${processedStyle}, ${processedQuality}`;
      
      // Count rough token estimation (not exact but a good approximation)
      const tokenCount = this.estimateTokenCount(prompt);
      
      // Return the prompt with metadata
      return {
        prompt: prompt,
        tokenCount: tokenCount,
        isWithinLimit: tokenCount <= 75
      };
    },
    
    /**
     * Estimates the token count of a prompt
     * @param {string} prompt - The prompt to estimate
     * @returns {number} Estimated token count
     */
    estimateTokenCount: function(prompt) {
      // This is a rough estimation, as the exact tokenization depends on the model
      // Words are approximately 1.3 tokens on average
      const words = prompt.split(/\s+/).length;
      return Math.ceil(words * 1.3);
    },
    
    /**
     * Returns suggested modifiers from a specific category
     * @param {string} category - The category to get modifiers from
     * @param {number} count - Number of modifiers to return
     * @param {string} model - The model being used
     * @returns {Array} Selected modifiers
     */
    suggestModifiers: function(category, count = 3, model = 'sdxl') {
      if (promptAssistant.knowledgeBase.modifiers[category]) {
        const examples = promptAssistant.knowledgeBase.modifiers[category].examples;
        
        // Check if there are model-specific recommendations
        const modelSpecific = promptAssistant.knowledgeBase.modifiers[category].modelSpecific;
        
        // Randomly select a specified number of examples
        const selections = [];
        
        // Include model-specific recommendations first if available
        if (modelSpecific && modelSpecific[model]) {
          // Prioritize model-specific modifiers
          const specificModifiers = modelSpecific[model];
          for (let i = 0; i < Math.min(Math.ceil(count/2), specificModifiers.length); i++) {
            selections.push(specificModifiers[i] + " (Recommended for this model)");
          }
        }
        
        // Fill remaining slots with general modifiers
        while (selections.length < count) {
          const randomIndex = Math.floor(Math.random() * examples.length);
          const example = examples[randomIndex];
          // Only add if not already in selections
          if (!selections.includes(example)) {
            selections.push(example);
          }
        }
        
        return selections;
      }
      return [];
    },
    
    /**
     * Returns a suggested negative prompt for the specified use case and model
     * @param {string} useCase - The use case (portrait, landscape, etc.)
     * @param {string} model - The model being used
     * @returns {string} Negative prompt
     */
    recommendNegativePrompt: function(useCase, model = 'sdxl') {
      // Check if there's a model-specific negative prompt
      if (promptAssistant.knowledgeBase.modelSpecificNegativePrompts[model] && 
          promptAssistant.knowledgeBase.modelSpecificNegativePrompts[model][useCase]) {
        return promptAssistant.knowledgeBase.modelSpecificNegativePrompts[model][useCase];
      }
      
      // Fallback to generic negative prompts
      return promptAssistant.knowledgeBase.negativePrompts[useCase] || 
             promptAssistant.knowledgeBase.negativePrompts.general;
    },
    
    /**
     * Recommends a template for a specific content type
     * @param {string} contentType - The type of content
     * @returns {Object} Template and examples
     */
    recommendTemplate: function(contentType) {
      if (promptAssistant.knowledgeBase.contentTemplates[contentType]) {
        return promptAssistant.knowledgeBase.contentTemplates[contentType];
      }
      return null;
    },
    
    /**
     * Returns model-specific recommendations for the provided prompt
     * @param {string} prompt - The prompt to optimize
     * @param {string} model - The model to optimize for
     * @returns {Object} Optimized prompt and parameters
     */
    optimizeForModel: function(prompt, model) {
      const modelInfo = promptAssistant.knowledgeBase.models[model];
      if (!modelInfo) return null;
      
      // Apply model-specific optimizations
      let optimizedPrompt = prompt;
      
      // SD 1.5 benefits from stronger quality terms and artist references
      if (model === 'sd15' && !prompt.toLowerCase().includes('detailed')) {
        optimizedPrompt = `highly detailed, ${optimizedPrompt}`;
      }
      
      // SDXL handles more natural language better
      if (model === 'sdxl') {
        // Remove excessive parentheses which aren't as necessary for SDXL
        optimizedPrompt = optimizedPrompt.replace(/\(\(/g, '(').replace(/\)\)/g, ')');
      }
      
      // Return optimized prompt and parameter recommendations
      return {
        originalPrompt: prompt,
        optimizedPrompt: optimizedPrompt,
        cfgRecommended: modelInfo.optimalSettings.cfgRange,
        samplerRecommended: modelInfo.optimalSettings.recommendedSampler,
        stepsRecommended: modelInfo.optimalSettings.stepCount,
        recommendedAspectRatios: modelInfo.optimalSettings.aspectRatios,
        promptNotes: modelInfo.promptNotes
      };
    },
    
    /**
     * Analyzes a prompt for potential issues or improvements
     * @param {string} prompt - The prompt to analyze
     * @param {string} model - The model being used
     * @returns {Object} Analysis results and suggestions
     */
    analyzePrompt: function(prompt, model = 'sdxl') {
      const analysis = {
        tokenEstimate: this.estimateTokenCount(prompt),
        isWithinLimit: this.estimateTokenCount(prompt) <= 75,
        hasQualityTerms: false,
        hasStyleTerms: false,
        hasSubject: true, // Assume true as we can't really detect this reliably
        potentialIssues: [],
        suggestions: []
      };
      
      // Check for quality terms
      const qualityTerms = ["detailed", "high quality", "8k", "4k", "hdr", "sharp", "clear"];
      analysis.hasQualityTerms = qualityTerms.some(term => prompt.toLowerCase().includes(term));
      
      // Check for style terms
      const styleTerms = ["painting", "photo", "digital art", "illustration", "render", "drawing"];
      analysis.hasStyleTerms = styleTerms.some(term => prompt.toLowerCase().includes(term));
      
      // Identify potential issues
      if (!analysis.hasQualityTerms && model === 'sd15') {
        analysis.potentialIssues.push("No quality terms detected, which may result in lower quality output for SD 1.5");
        analysis.suggestions.push("Add quality terms like 'highly detailed', '8K', or 'sharp focus'");
      }
      
      if (!analysis.hasStyleTerms) {
        analysis.potentialIssues.push("No clear art style or medium specified");
        analysis.suggestions.push("Add a specific art style or medium like 'digital painting', 'photograph', or 'oil painting'");
      }
      
      if (analysis.tokenEstimate > 75) {
        analysis.potentialIssues.push("Prompt likely exceeds token limit (estimated " + analysis.tokenEstimate + " tokens)");
        analysis.suggestions.push("Shorten prompt or remove less important elements to stay under 75 tokens");
      }
      
      // Model-specific checks
      if (model === 'sdxl' && prompt.includes('((') && prompt.includes('))')) {
        analysis.potentialIssues.push("SDXL doesn't require strong emphasis with double parentheses");
        analysis.suggestions.push("Use single parentheses or natural language without special formatting");
      }
      
      if (model === 'sd15' && !prompt.toLowerCase().includes("artstation") && !prompt.toLowerCase().includes("artist")) {
        analysis.suggestions.push("SD 1.5 often benefits from artist references or 'trending on artstation'");
      }
      
      return analysis;
    }
  },
  
  // Parameter optimization tools
  parameterAdvisor: {
    /**
     * Suggests appropriate CFG value based on desired intensity and model
     * @param {string} intensity - The desired intensity level
     * @param {string} model - The model being used
     * @returns {string} CFG recommendation
     */
    suggestCFG: function(intensity, model = 'sdxl') {
      // Base recommendations
      const recommendations = {
        creative: "5-7: This lower range gives the AI more creative freedom",
        balanced: "7-9: This balanced range provides good prompt adherence while avoiding artifacts",
        precise: "10-12: This higher range forces closer adherence to your prompt"
      };
      
      // Model-specific adjustments
      if (model === 'sdxl' && intensity === 'precise') {
        return "9-11: SDXL works well with slightly lower CFG than SD 1.5 for precise results";
      } else if (model === 'sd15' && intensity === 'precise') {
        return "11-13: SD 1.5 may require higher CFG values for strict prompt adherence";
      }
      
      return recommendations[intensity] || "7-9: The recommended balanced range for most use cases";
    },
    
    /**
     * Suggests appropriate step count based on desired quality and model
     * @param {string} quality - The desired quality level
     * @param {string} model - The model being used
     * @returns {string} Step count recommendation
     */
    suggestSteps: function(quality, model = 'sdxl') {
      // Base recommendations
      const recommendations = {
        draft: "20-25: Lower steps for quick drafts and iterations",
        standard: "30-40: Standard quality for most purposes",
        high: "45-60: Higher steps for detailed final images"
      };
      
      // Model-specific adjustments
      if (model === 'sdxl' && quality === 'high') {
        return "40-50: SDXL produces high quality with fewer steps than SD 1.5";
      } else if (model === 'sd15' && quality === 'draft') {
        return "15-20: SD 1.5 can produce usable drafts with very few steps";
      }
      
      return recommendations[quality] || "30-40: The recommended range for balanced quality and speed";
    },
    
    /**
     * Suggests appropriate sampler based on intended use and model
     * @param {string} purpose - The intended use
     * @param {string} model - The model being used
     * @returns {string} Sampler recommendation
     */
    suggestSampler: function(purpose, model = 'sdxl') {
      // Base recommendations
      const recommendations = {
        speed: "DDIM: Fastest generation, good for quick tests",
        balanced: "Euler a: Good balance of quality and speed for most purposes",
        quality: "DPM++ 2M Karras: Highest quality but slower processing",
        technical: "UniPC: Best for architecture and technical illustrations"
      };
      
      // Model-specific adjustments
      if (model === 'sdxl' && purpose === 'quality') {
        return "DPM++ 2M Karras: Optimal quality sampler for SDXL, especially for portraits and photorealism";
      } else if (model === 'sd15' && purpose === 'balanced') {
        return "Euler a: Particularly good all-around sampler for SD 1.5";
      }
      
      return recommendations[purpose] || "Euler a: The recommended all-purpose sampler";
    },
    
    /**
     * Suggests appropriate strength value for img2img based on desired change amount
     * @param {string} changeAmount - The desired amount of change
     * @param {string} model - The model being used
     * @returns {string} Strength recommendation
     */
    suggestImg2ImgStrength: function(changeAmount, model = 'sdxl') {
      // Base recommendations
      const recommendations = {
        subtle: "0.2-0.4: Subtle changes that preserve most of the original image",
        balanced: "0.5-0.6: Balanced transformation that allows significant changes while maintaining composition",
        major: "0.7-0.9: Major transformation using original as loose inspiration"
      };
      
      // Model-specific adjustments
      if (model === 'sdxl' && changeAmount === 'subtle') {
        return "0.15-0.35: SDXL can make effective subtle changes with lower strength values";
      }
      
      return recommendations[changeAmount] || "0.5-0.6: The recommended range for balanced transformations";
    },
    
    /**
     * Recommends complete parameter set for a specific scenario
     * @param {string} scenario - The generation scenario
     * @param {string} model - The model being used
     * @returns {Object} Complete parameter recommendations
     */
    recommendParameterSet: function(scenario, model = 'sdxl') {
      const parameterSets = {
        "portrait": {
          description: "Parameters optimized for portrait generation",
          cfg: model === 'sdxl' ? "7-9" : "8-10",
          steps: model === 'sdxl' ? "30-40" : "35-45",
          sampler: "DPM++ 2M Karras",
          width: model === 'sdxl' ? 1024 : 512,
          height: model === 'sdxl' ? 1024 : 768,
          notes: "Portraits benefit from slightly higher CFG for facial details"
        },
        "landscape": {
          description: "Parameters optimized for landscape generation",
          cfg: "6-8",
          steps: model === 'sdxl' ? "30-40" : "30-40",
          sampler: model === 'sdxl' ? "DPM++ 2M Karras" : "Euler a",
          width: model === 'sdxl' ? 1024 : 768,
          height: model === 'sdxl' ? 768 : 512,
          notes: "Landscapes work well with lower CFG for more creative interpretation"
        },
        "concept": {
          description: "Parameters optimized for concept art generation",
          cfg: "7-9",
          steps: model === 'sdxl' ? "35-45" : "40-50",
          sampler: "Euler a",
          width: model === 'sdxl' ? 1024 : 768,
          height: model === 'sdxl' ? 1024 : 768,
          notes: "Concept art benefits from balanced parameters for creativity with control"
        },
        "anime": {
          description: "Parameters optimized for anime style generation",
          cfg: model === 'sd15' ? "6-8" : "8-10", // SD 1.5 is better at anime with lower CFG
          steps: "25-35",
          sampler: "Euler a",
          width: 512,
          height: 768,
          notes: model === 'sd15' ? "SD 1.5 excels at anime styles" : "SDXL may need higher CFG for anime styles"
        }
      };
      
      return parameterSets[scenario] || {
        description: "General purpose parameters",
        cfg: "7-9",
        steps: "30-40",
        sampler: model === 'sdxl' ? "DPM++ 2M Karras" : "Euler a",
        width: model === 'sdxl' ? 1024 : 512,
        height: model === 'sdxl' ? 1024 : 512,
        notes: "Balanced parameters for general use cases"
      };
    }
  },
  
  // Image analysis and improvement suggestions
  imageAnalyzer: {
    /**
     * Analyzes results based on prompt and description
     * @param {string} promptUsed - The prompt that was used
     * @param {string} imageDescription - Description of the results
     * @param {string} model - The model that was used
     * @returns {Array} Improvement suggestions
     */
    analyzeResults: function(promptUsed, imageDescription, model = 'sdxl') {
      const suggestions = [];
      const isSDXL = model === 'sdxl';
      
      // Check for common issues based on description
      if (imageDescription.toLowerCase().includes("poor hands") || 
          imageDescription.toLowerCase().includes("finger") || 
          imageDescription.toLowerCase().includes("deformed")) {
        
        suggestions.push("Add 'perfect hands, accurate anatomy' to your prompt");
        
        if (isSDXL) {
          suggestions.push("Add 'bad hands, extra fingers, missing fingers, deformed' to your negative prompt");
          suggestions.push("For SDXL, consider using higher CFG (9-10) for better anatomical accuracy");
        } else {
          suggestions.push("For SD 1.5, add specific details about hands in the negative prompt: 'bad hands, extra fingers, missing fingers, deformed, mutated hands'");
          suggestions.push("Consider using SDXL for better anatomical accuracy if available");
        }
      }
      
      if (imageDescription.toLowerCase().includes("proportion") || 
          imageDescription.toLowerCase().includes("anatomy")) {
        
        if (!isSDXL) {
          suggestions.push("Consider using SDXL which has better anatomical accuracy");
        }
        
        suggestions.push("Add 'perfect proportions, accurate anatomy' to your prompt");
        suggestions.push("Try using ControlNet with a pose reference for better anatomical control");
      }
      
      if (imageDescription.toLowerCase().includes("composition") || 
          imageDescription.toLowerCase().includes("framing")) {
        
        suggestions.push("Add specific composition terms like 'rule of thirds, professional composition'");
        suggestions.push("Consider using a reference image with img2img at low strength (0.3-0.4)");
        suggestions.push("Try ControlNet with Kenny Mode (edge detection) to control composition");
      }
      
      if (imageDescription.toLowerCase().includes("style") || 
          imageDescription.toLowerCase().includes("inconsistent")) {
        
        if (isSDXL) {
          suggestions.push("SDXL works best with clear style descriptions rather than artist references");
          suggestions.push("Try using more detailed medium descriptions like 'detailed oil painting' or 'professional digital art'");
        } else {
          suggestions.push("SD 1.5 benefits from artist references - try adding 'in the style of [artist name]'");
          suggestions.push("Add 'trending on artstation' for a more cohesive digital art style");
        }
      }
      
      // Prompt analysis
      if (!promptUsed.toLowerCase().includes("detailed") && !promptUsed.toLowerCase().includes("quality")) {
        suggestions.push("Add quality enhancers like '8K, highly detailed, masterpiece'");
      }
      
      if (!promptUsed.toLowerCase().includes("lighting")) {
        suggestions.push("Specify lighting type to improve atmosphere (e.g., 'dramatic lighting', 'soft natural lighting')");
      }
      
      // If no specific issues mentioned, provide general improvement suggestions
      if (suggestions.length === 0) {
        suggestions.push("Try increasing your CFG value for closer prompt adherence");
        suggestions.push("Add quality enhancers like '8K, highly detailed, masterpiece'");
        suggestions.push("Try different seeds to see alternative interpretations");
        
        if (isSDXL) {
          suggestions.push("SDXL benefits from clear, detailed descriptions rather than special formatting");
        } else {
          suggestions.push("SD 1.5 benefits from emphasis techniques like (parentheses) around key elements");
        }
      }
      
      return suggestions;
    },
    
    /**
     * Recommends next steps for iterative improvement
     * @param {string} currentPrompt - The current prompt
     * @param {string} model - The model being used
     * @returns {Array} Recommended next steps
     */
    recommendNextSteps: function(currentPrompt, model = 'sdxl') {
      const nextSteps = [
        "Try a slightly higher CFG value for more precise prompt adherence",
        "Experiment with different samplers to see which works best for this content",
        "Consider adding more specific descriptive terms for key elements",
        "If composition is good but details need work, try img2img with strength 0.4-0.5",
        "Save successful seeds for consistent results in future iterations"
      ];
      
      // Model-specific recommendations
      if (model === 'sdxl') {
        nextSteps.push("Consider using SDXL's refinement feature for enhanced details");
        nextSteps.push("SDXL works well with higher resolutions - try 1024x1024 or larger");
      } else if (model === 'sd15') {
        nextSteps.push("SD 1.5 benefits from artist references and emphasis techniques");
        nextSteps.push("Try adding 'trending on artstation' for improved artistic quality");
      }
      
      return nextSteps;
    },
    
    /**
     * Analyzes common problems with specific subject types
     * @param {string} subjectType - The type of subject
     * @param {string} model - The model being used
     * @returns {Object} Common problems and solutions
     */
    analyzeCommonProblems: function(subjectType, model = 'sdxl') {
      const problems = {
        "portrait": {
          issues: [
            "Deformed or unnatural facial features",
            "Unnatural or malformed hands",
            "Strange body proportions",
            "Inconsistent lighting on face"
          ],
          solutions: [
            "Add 'symmetrical face, realistic features, detailed' to your prompt",
            "Add detailed hand descriptions or avoid showing hands",
            "Use ControlNet with pose reference for better proportions",
            "Specify lighting direction (e.g., 'from the left side')"
          ]
        },
        "landscape": {
          issues: [
            "Unrealistic scale of elements",
            "Poor perspective and depth",
            "Inconsistent lighting across the scene",
            "Unnatural terrain features"
          ],
          solutions: [
            "Describe foreground, midground, and background elements explicitly",
            "Add 'wide angle lens' or specific focal length",
            "Specify time of day and light source direction",
            "Reference real geographic features (e.g., 'like Scottish Highlands')"
          ]
        },
        "character": {
          issues: [
            "Inconsistent character features across images",
            "Unrealistic clothing or armor details",
            "Poor character proportions",
            "Unnatural poses"
          ],
          solutions: [
            "Use same seed and consistent character description",
            "Reference specific materials and design styles",
            "Add 'anatomically correct, proper proportions'",
            "Use ControlNet with pose reference"
          ]
        }
      };
      
      // Model-specific adjustments
      if (model === 'sdxl' && problems[subjectType]) {
        problems[subjectType].solutions.push("SDXL generally produces better anatomy - increase CFG slightly for more precision");
      } else if (model === 'sd15' && problems[subjectType]) {
        problems[subjectType].solutions.push("SD 1.5 may require more detailed negative prompts to avoid anatomical issues");
      }
      
      return problems[subjectType] || {
        issues: ["Unclear subject focus", "Inconsistent style", "Poor quality details"],
        solutions: ["Make the main subject more explicit in your prompt", "Specify a clear artistic style or medium", "Add quality enhancers"]
      };
    }
  },
  
  // UI text and guidance
  interface: {
    welcomeMessage: 
      "Welcome to the Enhanced Stable Diffusion Prompt Assistant\n" +
      "This tool will help you create optimized prompts and settings for AI image generation\n" +
      "Based on the comprehensive OpenArt AI knowledge base",
    
    mainMenuOptions: [
      "Build a structured prompt",
      "Get negative prompt recommendations",
      "Optimize parameters for a specific model",
      "Analyze results and get improvement suggestions",
      "Advanced techniques guide",
      "Content-specific templates",
      "ControlNet guidance",
      "Exit"
    ],
    
    promptBuilderInstructions:
      "Let's build an effective prompt with the recommended structure:\n" +
      "1. Main Subject - What/who is the focus?\n" +
      "2. Details & Modifiers - Specific characteristics, environment, etc.\n" +
      "3. Art Style & Medium - The artistic approach (photography, painting, etc.)\n" +
      "4. Technical Quality - Resolution and rendering parameters",
    
    modelSelectionInstructions:
      "Different Stable Diffusion models excel at different types of content.\n" +
      "Please select the model you're using for customized recommendations:",
    
    parameterGuidanceInstructions:
      "Let's optimize your generation parameters.\n" +
      "These settings control how the AI interprets your prompt and generates the image.",
    
    negativePromptInstructions:
      "Negative prompts help avoid unwanted elements in your generation.\n" +
      "Choose a use case for tailored negative prompt recommendations:",
    
    resultAnalysisInstructions:
      "To provide improvement suggestions, please describe the results you received\n" +
      "and any specific issues you'd like to address:",
      
    contentTemplateInstructions:
      "Content-specific templates can help you structure prompts for particular subjects.\n" +
      "Select a content type to see a recommended template structure:",
      
    controlNetGuidanceInstructions:
      "ControlNet provides precise guidance for image generation using reference images.\n" +
      "Select a ControlNet mode to learn how to use it effectively:"
  },
  
  // Core application functions
  run: function() {
    console.log(this.interface.welcomeMessage);
    this.showMainMenu();
  },
  
  showMainMenu: function() {
    console.log("\nMain Menu:");
    this.interface.mainMenuOptions.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    
    // In a real implementation, handle user input and call appropriate functions
    console.log("\nSelect an option by entering its number.");
  },
  
  // File operations for saving and loading prompts
  fileOperations: {
    /**
     * Saves a prompt to a file
     * @param {string} prompt - The prompt to save
     * @param {string} filename - The filename to save to
     * @param {Object} metadata - Additional metadata to save
     * @returns {Promise<string>} Status message
     */
    savePrompt: async function(prompt, filename, metadata = {}) {
      const promptData = {
        prompt: prompt,
        timestamp: new Date().toISOString(),
        model: metadata.model || "unknown",
        parameters: metadata.parameters || {},
        notes: metadata.notes || ""
      };
      
      const filePath = path.join('/Users/cpconnor/Desktop/VSC Scripts/StableDiffusionPromptAssistant', 
                               'saved_prompts', 
                               `${filename || 'prompt_' + Date.now()}.json`);
      
      try {
        // Create directory if it doesn't exist
        const dir = path.dirname(filePath);
        if (!fsSync.existsSync(dir)) {
          await fs.mkdir(dir, { recursive: true });
        }
        
        await fs.writeFile(filePath, JSON.stringify(promptData, null, 2));
        return `Prompt saved to ${filePath}`;
      } catch (error) {
        return `Error saving prompt: ${error.message}`;
      }
    },
    
    /**
     * Loads a prompt from a file
     * @param {string} filename - The filename to load from
     * @returns {Promise<Object>} The loaded prompt data
     */
    loadPrompt: async function(filename) {
      try {
        const filePath = path.join('/Users/cpconnor/Desktop/VSC Scripts/StableDiffusionPromptAssistant', 
                                 'saved_prompts', 
                                 filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        return {
          error: true,
          message: `Error loading prompt: ${error.message}`
        };
      }
    },
    
    /**
     * Lists all saved prompts
     * @returns {Promise<Array>} List of saved prompts
     */
    listSavedPrompts: async function() {
      try {
        const dir = path.join('/Users/cpconnor/Desktop/VSC Scripts/StableDiffusionPromptAssistant', 
                           'saved_prompts');
        
        if (!fsSync.existsSync(dir)) {
          return "No saved prompts found";
        }
        
        const files = await fs.readdir(dir);
        const promptFiles = files.filter(file => file.endsWith('.json'));
        
        const promptsList = await Promise.all(promptFiles.map(async (file) => {
          try {
            const data = await fs.readFile(path.join(dir, file), 'utf8');
            const promptData = JSON.parse(data);
            return {
              filename: file,
              timestamp: promptData.timestamp,
              model: promptData.model || "unknown",
              previewText: promptData.prompt.substring(0, 50) + (promptData.prompt.length > 50 ? '...' : '')
            };
          } catch (err) {
            return {
              filename: file,
              timestamp: 'Unknown',
              model: 'Unknown',
              previewText: 'Error reading file'
            };
          }
        }));
        
        return promptsList;
      } catch (error) {
        return {
          error: true,
          message: `Error listing prompts: ${error.message}`
        };
      }
    },
    
    /**
     * Exports prompts to various formats
     * @param {string} format - The format to export to (txt, md, json)
     * @param {Array} promptIds - The prompt IDs to export
     * @returns {Promise<string>} Path to the exported file
     */
    exportPrompts: async function(format, promptIds) {
      try {
        const dir = path.join('/Users/cpconnor/Desktop/VSC Scripts/StableDiffusionPromptAssistant', 
                           'exports');
        
        if (!fsSync.existsSync(dir)) {
          await fs.mkdir(dir, { recursive: true });
        }
        
        const exportPath = path.join(dir, `prompts_export_${Date.now()}.${format}`);
        const prompts = [];
        
        // Load each prompt
        for (const id of promptIds) {
          const promptData = await this.loadPrompt(id);
          if (!promptData.error) {
            prompts.push(promptData);
          }
        }
        
        // Format and save according to requested format
        switch(format) {
          case 'txt':
            const textContent = prompts.map(p => 
              `--- ${p.timestamp} [${p.model}] ---\n${p.prompt}\n\nParameters: ${JSON.stringify(p.parameters)}\n\n`
            ).join('\n');
            await fs.writeFile(exportPath, textContent);
            break;
          case 'md':
            const mdContent = prompts.map(p => 
              `## Prompt (${p.model})\n*${p.timestamp}*\n\n\`\`\`\n${p.prompt}\n\`\`\`\n\n### Parameters\n\`\`\`json\n${JSON.stringify(p.parameters, null, 2)}\n\`\`\`\n\n${p.notes ? `### Notes\n${p.notes}\n\n` : ''}\n\n---\n\n`
            ).join('\n');
            await fs.writeFile(exportPath, mdContent);
            break;
          case 'json':
            await fs.writeFile(exportPath, JSON.stringify(prompts, null, 2));
            break;
          default:
            throw new Error('Unsupported format');
        }
        
        return exportPath;
        
      } catch (error) {
        return {
          error: true,
          message: `Error exporting prompts: ${error.message}`
        };
      }
    }
  }
};

// Example implementation of a command-line interface for the assistant
function runConsoleInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log(promptAssistant.interface.welcomeMessage);
  
  function showMainMenu() {
    console.log("\nMain Menu:");
    promptAssistant.interface.mainMenuOptions.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    
    rl.question("\nSelect an option: ", (answer) => {
      const option = parseInt(answer);
      
      switch(option) {
        case 1:
          buildPromptDialog();
          break;
        case 2:
          getNegativePromptDialog();
          break;
        case 3:
          optimizeParametersDialog();
          break;
        case 4:
          analyzeResultsDialog();
          break;
        case 5:
          showAdvancedTechniquesDialog();
          break;
        case 6:
          showContentTemplatesDialog();
          break;
        case 7:
          showControlNetGuidanceDialog();
          break;
        case 8:
          console.log("Thank you for using the Stable Diffusion Prompt Assistant. Goodbye!");
          rl.close();
          break;
        default:
          console.log("Invalid option. Please try again.");
          showMainMenu();
      }
    });
  }
  
  // Implementation of dialog functions
  function buildPromptDialog() {
    console.log(promptAssistant.interface.promptBuilderInstructions);
    
    // First get the model for model-specific optimizations
    console.log("\nWhich model are you using?");
    console.log("1. Stable Diffusion XL (SDXL)");
    console.log("2. Stable Diffusion 1.5 (SD 1.5)");
    console.log("3. Stable Diffusion 2.1 (SD 2.1)");
    
    rl.question("\nSelect a model (1-3): ", (modelChoice) => {
      let model;
      switch(parseInt(modelChoice)) {
        case 1: model = "sdxl"; break;
        case 2: model = "sd15"; break;
        case 3: model = "sd21"; break;
        default: 
          console.log("Invalid choice. Using SDXL as default.");
          model = "sdxl";
      }
      
      // Now build the prompt with model-specific considerations
      console.log(`\nBuilding prompt optimized for ${promptAssistant.knowledgeBase.models[model].name}`);
      console.log(`Note: ${promptAssistant.knowledgeBase.models[model].promptNotes}`);
      
      rl.question("\nSubject (what/who is the focus?): ", (subject) => {
        rl.question("Details (specific characteristics, environment): ", (details) => {
          rl.question("Art Style & Medium (e.g., oil painting, photograph): ", (style) => {
            rl.question("Technical Quality (e.g., 8K, highly detailed): ", (quality) => {
              // Ask about prompt emphasis options
              console.log("\nPrompt emphasis options:");
              console.log("1. Use parentheses to emphasize important elements (good for SD 1.5)");
              console.log("2. Standard format without special emphasis (better for SDXL)");
              
              rl.question("\nSelect emphasis style (1-2): ", (emphasisChoice) => {
                const useEmphasis = parseInt(emphasisChoice) === 1;
                
                // Build the prompt with selected options
                const promptResult = promptAssistant.promptBuilder.buildStructuredPrompt(
                  subject, details, style, quality, model, { useWeighting: useEmphasis }
                );
                
                console.log("\nYour optimized prompt:");
                console.log(promptResult.prompt);
                
                if (promptResult.tokenCount > 75) {
                  console.log(`\nWARNING: Prompt may exceed token limit (estimated ${promptResult.tokenCount} tokens)`);
                  console.log("Consider shortening your prompt for better results.");
                } else {
                  console.log(`\nEstimated token count: ${promptResult.tokenCount} (within 75 token limit)`);
                }
                
                // Analyze the prompt for potential improvements
                const analysis = promptAssistant.promptBuilder.analyzePrompt(promptResult.prompt, model);
                
                if (analysis.potentialIssues.length > 0) {
                  console.log("\nPotential improvements:");
                  analysis.suggestions.forEach((suggestion, index) => {
                    console.log(`${index + 1}. ${suggestion}`);
                  });
                }
                
                rl.question("\nWould you like to save this prompt? (y/n): ", (answer) => {
                  if (answer.toLowerCase() === 'y') {
                    rl.question("Filename (leave blank for auto-generated): ", (filename) => {
                      // Using promise pattern but handling it synchronously for the CLI
                      promptAssistant.fileOperations.savePrompt(promptResult.prompt, filename, {
                        model: model,
                        parameters: {
                          "Recommended CFG": promptAssistant.knowledgeBase.models[model].optimalSettings.cfgRange,
                          "Recommended Sampler": promptAssistant.knowledgeBase.models[model].optimalSettings.recommendedSampler,
                          "Recommended Steps": promptAssistant.knowledgeBase.models[model].optimalSettings.stepCount
                        }
                      }).then(result => {
                        console.log(result);
                        showMainMenu();
                      }).catch(err => {
                        console.error("Error saving prompt:",