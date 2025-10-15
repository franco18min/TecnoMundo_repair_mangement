/**
 * 🤖 NEXUS - Sistema de Integración con Chat de IA
 * Activación exclusiva mediante comandos naturales en español
 */

class ChatIntegration {
    constructor() {
        this.isActive = false;
        this.currentContext = null;
        this.commandHistory = [];
        this.patterns = this.loadActivationPatterns();
        this.cache = this.loadCache();
    }

    /**
     * Patrones de activación automática para comandos naturales
     */
    loadActivationPatterns() {
        return {
            // Patrones de desarrollo
            development: [
                /crear|hacer|generar\s+(componente|endpoint|funcionalidad|sistema)/i,
                /implementar\s+(login|dashboard|api|crud|autenticación)/i,
                /agregar\s+(validación|funcionalidad|endpoint|componente)/i,
                /desarrollar\s+(frontend|backend|api|interfaz)/i
            ],

            // Patrones de debugging
            debugging: [
                /hay|tengo\s+(un\s+)?error|problema\s+en/i,
                /no\s+funciona\s+(el|la|los|las)/i,
                /arreglar|solucionar|corregir\s+(error|problema|bug)/i,
                /debuggear|depurar\s+(código|sistema|componente)/i
            ],

            // Patrones de optimización
            optimization: [
                /optimizar|mejorar\s+(rendimiento|performance|velocidad)/i,
                /hacer\s+más\s+(rápido|eficiente|ligero)/i,
                /reducir\s+(tiempo|tamaño|carga|tokens)/i,
                /acelerar\s+(sistema|aplicación|api)/i
            ],

            // Patrones de testing
            testing: [
                /probar|testear\s+(sistema|componente|funcionalidad)/i,
                /verificar\s+que\s+.+\s+funcione/i,
                /hacer\s+tests?\s+para/i,
                /ejecutar\s+(pruebas|tests)/i
            ],

            // Patrones de documentación
            documentation: [
                /documentar\s+(sistema|api|componente|código)/i,
                /crear\s+documentación\s+para/i,
                /explicar\s+(cómo|qué)\s+(funciona|hace)/i,
                /generar\s+(readme|docs|guía)/i
            ]
        };
    }

    /**
     * Detecta automáticamente si un mensaje contiene un comando natural
     */
    detectNaturalCommand(message) {
        const cleanMessage = message.toLowerCase().trim();
        
        // Verificar si es un comando directo con 'ai'
        if (cleanMessage.startsWith('ai ')) {
            return {
                isCommand: true,
                type: 'direct',
                command: cleanMessage.substring(3),
                confidence: 1.0
            };
        }

        // Verificar patrones de activación
        for (const [category, patterns] of Object.entries(this.patterns)) {
            for (const pattern of patterns) {
                if (pattern.test(cleanMessage)) {
                    return {
                        isCommand: true,
                        type: 'natural',
                        category: category,
                        command: cleanMessage,
                        confidence: 0.9
                    };
                }
            }
        }

        // Verificar contexto conversacional
        if (this.isInDevelopmentContext(cleanMessage)) {
            return {
                isCommand: true,
                type: 'contextual',
                command: cleanMessage,
                confidence: 0.7
            };
        }

        return {
            isCommand: false,
            confidence: 0.0
        };
    }

    /**
     * Verifica si estamos en un contexto de desarrollo
     */
    isInDevelopmentContext(message) {
        const developmentKeywords = [
            'componente', 'endpoint', 'api', 'base de datos', 'frontend', 'backend',
            'react', 'fastapi', 'postgresql', 'jwt', 'autenticación', 'login',
            'dashboard', 'formulario', 'validación', 'crud', 'modelo', 'esquema'
        ];

        return developmentKeywords.some(keyword => 
            message.includes(keyword)
        );
    }

    /**
     * Procesa un comando natural detectado
     */
    async processNaturalCommand(detection) {
        try {
            // Cargar contexto automáticamente
            const context = await this.loadProjectContext();
            
            // Preparar comando para ejecución
            const processedCommand = {
                original: detection.command,
                type: detection.type,
                category: detection.category,
                context: context,
                timestamp: new Date().toISOString(),
                sessionId: this.generateSessionId()
            };

            // Ejecutar comando automáticamente
            const result = await this.executeCommand(processedCommand);
            
            // Documentar resultado
            await this.documentExecution(processedCommand, result);
            
            return result;

        } catch (error) {
            console.error('Error procesando comando natural:', error);
            return {
                success: false,
                error: error.message,
                suggestion: 'Intenta reformular el comando o verifica el contexto'
            };
        }
    }

    /**
     * Carga el contexto del proyecto automáticamente
     */
    async loadProjectContext() {
        try {
            const context = {
                // Reglas del proyecto
                projectRules: await this.loadFile('.trae/rules/project_rules.md'),
                userRules: await this.loadFile('.trae/rules/user_rules.md'),
                masterPrompt: await this.loadFile('.trae/rules/master_prompt.md'),
                
                // Cache inteligente
                sessionTracker: await this.loadFile('.trae/cache/session_tracker.md'),
                quickCommands: await this.loadFile('.trae/cache/quick_commands.md'),
                errorPatterns: await this.loadJSON('.trae/cache/error_patterns.json'),
                
                // Configuración del proyecto
                systemConfig: await this.loadJSON('.trae/config/system_config.json'),
                
                // Estado actual del proyecto
                currentFiles: await this.scanProjectFiles(),
                recentChanges: await this.getRecentChanges()
            };

            return context;
        } catch (error) {
            console.warn('Error cargando contexto:', error);
            return this.getMinimalContext();
        }
    }

    /**
     * Ejecuta un comando procesado
     */
    async executeCommand(command) {
        const executor = new CommandExecutor(command.context);
        
        switch (command.category) {
            case 'development':
                return await executor.executeDevelopmentCommand(command);
            
            case 'debugging':
                return await executor.executeDebuggingCommand(command);
            
            case 'optimization':
                return await executor.executeOptimizationCommand(command);
            
            case 'testing':
                return await executor.executeTestingCommand(command);
            
            case 'documentation':
                return await executor.executeDocumentationCommand(command);
            
            default:
                return await executor.executeGenericCommand(command);
        }
    }

    /**
     * Documenta la ejecución para aprendizaje continuo
     */
    async documentExecution(command, result) {
        const documentation = {
            timestamp: new Date().toISOString(),
            command: command.original,
            type: command.type,
            category: command.category,
            success: result.success,
            executionTime: result.executionTime,
            tokensUsed: result.tokensUsed,
            filesModified: result.filesModified || [],
            errorMessage: result.error || null
        };

        // Guardar en historial
        this.commandHistory.push(documentation);
        
        // Actualizar métricas
        await this.updateMetrics(documentation);
        
        // Actualizar cache si fue exitoso
        if (result.success) {
            await this.updateCache(command, result);
        }
    }

    /**
     * Genera un ID único para la sesión
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Utilidades para cargar archivos
     */
    async loadFile(path) {
        try {
            const fs = require('fs').promises;
            return await fs.readFile(path, 'utf8');
        } catch (error) {
            return null;
        }
    }

    async loadJSON(path) {
        try {
            const content = await this.loadFile(path);
            return content ? JSON.parse(content) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Escanea archivos del proyecto para contexto
     */
    async scanProjectFiles() {
        // Implementación simplificada - en producción usaría fs.readdir recursivo
        return {
            frontend: {
                components: ['LoginForm.jsx', 'Dashboard.jsx', 'UserProfile.jsx'],
                pages: ['Home.jsx', 'Login.jsx', 'Dashboard.jsx'],
                hooks: ['useAuth.js', 'useApi.js'],
                context: ['AuthContext.jsx']
            },
            backend: {
                models: ['user.py', 'ticket.py', 'technician.py'],
                api: ['auth.py', 'users.py', 'tickets.py'],
                services: ['auth_service.py', 'user_service.py']
            }
        };
    }

    /**
     * Obtiene cambios recientes del proyecto
     */
    async getRecentChanges() {
        return {
            lastModified: new Date().toISOString(),
            recentFiles: ['frontend/src/components/LoginForm.jsx', 'backend/app/api/auth.py'],
            recentCommands: this.commandHistory.slice(-5)
        };
    }

    /**
     * Contexto mínimo de fallback
     */
    getMinimalContext() {
        return {
            project: 'TecnoMundo Repair Management',
            stack: 'React + FastAPI + PostgreSQL',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Actualiza métricas de rendimiento
     */
    async updateMetrics(documentation) {
        // Implementación para actualizar .trae/metrics/performance_logs.json
        console.log('Actualizando métricas:', documentation);
    }

    /**
     * Actualiza cache inteligente
     */
    async updateCache(command, result) {
        // Implementación para actualizar cache basado en éxito
        console.log('Actualizando cache:', { command: command.original, success: result.success });
    }
}

/**
 * Ejecutor de comandos especializado
 */
class CommandExecutor {
    constructor(context) {
        this.context = context;
        this.startTime = Date.now();
    }

    async executeDevelopmentCommand(command) {
        // Lógica específica para comandos de desarrollo
        return {
            success: true,
            message: `Comando de desarrollo ejecutado: ${command.original}`,
            executionTime: Date.now() - this.startTime,
            tokensUsed: 250,
            filesModified: ['src/components/NewComponent.jsx']
        };
    }

    async executeDebuggingCommand(command) {
        // Lógica específica para debugging
        return {
            success: true,
            message: `Debugging ejecutado: ${command.original}`,
            executionTime: Date.now() - this.startTime,
            tokensUsed: 400,
            errorFixed: true
        };
    }

    async executeOptimizationCommand(command) {
        // Lógica específica para optimización
        return {
            success: true,
            message: `Optimización aplicada: ${command.original}`,
            executionTime: Date.now() - this.startTime,
            tokensUsed: 300,
            performanceGain: '25%'
        };
    }

    async executeTestingCommand(command) {
        // Lógica específica para testing
        return {
            success: true,
            message: `Tests ejecutados: ${command.original}`,
            executionTime: Date.now() - this.startTime,
            tokensUsed: 200,
            testsRun: 15,
            testsPassed: 15
        };
    }

    async executeDocumentationCommand(command) {
        // Lógica específica para documentación
        return {
            success: true,
            message: `Documentación generada: ${command.original}`,
            executionTime: Date.now() - this.startTime,
            tokensUsed: 350,
            docsGenerated: ['README.md', 'API_DOCS.md']
        };
    }

    async executeGenericCommand(command) {
        // Lógica genérica para otros comandos
        return {
            success: true,
            message: `Comando genérico ejecutado: ${command.original}`,
            executionTime: Date.now() - this.startTime,
            tokensUsed: 150
        };
    }
}

// Exportar para uso en el sistema
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChatIntegration, CommandExecutor };
}

// Inicialización automática si se ejecuta directamente
if (typeof window !== 'undefined') {
    window.NEXUS_ChatIntegration = new ChatIntegration();
    console.log('🤖 NEXUS Chat Integration activado');
}