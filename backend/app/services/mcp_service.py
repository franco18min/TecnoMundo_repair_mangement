"""
Servicio MCP para TecnoMundo Repair Management

Este servicio proporciona una interfaz para que Jules (el asistente AI)
pueda realizar consultas a la base de datos a través del MCP de Supabase.

Uso:
- Jules puede usar las funciones MCP directamente
- No se requieren credenciales de base de datos
- Todas las consultas pasan por el MCP de Supabase
"""

from typing import Dict, List, Any, Optional
import json

class MCPService:
    """
    Servicio para interactuar con la base de datos a través de MCP.
    
    Este servicio está diseñado para ser usado por Jules (el asistente AI)
    para realizar consultas sin necesidad de credenciales directas.
    """
    
    def __init__(self):
        self.schemas = ["system", "customer"]
        self.mcp_enabled = True
    
    def get_database_info(self) -> Dict[str, Any]:
        """
        Retorna información sobre la estructura de la base de datos.
        """
        return {
            "provider": "Supabase",
            "connection_type": "MCP",
            "schemas": self.schemas,
            "tables": {
                "system": [
                    "roles",
                    "user", 
                    "notifications",
                    "branch"
                ],
                "customer": [
                    "customer",
                    "status_order",
                    "device_type", 
                    "repair_order",
                    "device_condition"
                ]
            },
            "mcp_config_path": ".kilocode/mcp.json"
        }
    
    def get_table_structure(self, schema: str, table: str) -> Dict[str, Any]:
        """
        Retorna la estructura de una tabla específica.
        
        Args:
            schema: Nombre del schema (system o customer)
            table: Nombre de la tabla
        """
        structures = {
            "system": {
                "roles": {
                    "columns": ["id", "role_name"],
                    "description": "Roles de usuarios del sistema"
                },
                "user": {
                    "columns": ["id", "username", "password", "email", "role_id"],
                    "description": "Usuarios del sistema",
                    "relationships": ["roles"]
                },
                "notifications": {
                    "columns": ["id", "user_id", "message", "is_read", "link_to", "created_at"],
                    "description": "Notificaciones para usuarios",
                    "relationships": ["user"]
                },
                "branch": {
                    "columns": ["id", "name", "address", "phone"],
                    "description": "Sucursales del negocio"
                }
            },
            "customer": {
                "customer": {
                    "columns": ["id", "first_name", "last_name", "phone_number", "dni"],
                    "description": "Información de clientes"
                },
                "status_order": {
                    "columns": ["id", "status_name"],
                    "description": "Estados posibles de órdenes"
                },
                "device_type": {
                    "columns": ["id", "type_name"],
                    "description": "Tipos de dispositivos"
                },
                "repair_order": {
                    "columns": ["id", "customer_id", "device_type_id", "status_id", "technician_id", "branch_id", "description", "created_at", "updated_at"],
                    "description": "Órdenes de reparación",
                    "relationships": ["customer", "device_type", "status_order", "user", "branch"]
                },
                "device_condition": {
                    "columns": ["id", "order_id", "check_description", "client_answer", "technician_finding", "technician_notes"],
                    "description": "Checklist de condición de dispositivos",
                    "relationships": ["repair_order"]
                }
            }
        }
        
        return structures.get(schema, {}).get(table, {})
    
    def get_mcp_instructions(self) -> Dict[str, str]:
        """
        Retorna instrucciones para Jules sobre cómo usar el MCP.
        """
        return {
            "overview": "Usa las funciones MCP de Supabase para consultas de base de datos",
            "available_functions": [
                "mcp_Postgrest_postgrestRequest - Para hacer consultas HTTP a la API",
                "mcp_Postgrest_sqlToRest - Para convertir SQL a requests REST"
            ],
            "schemas": "system, customer",
            "examples": {
                "get_all_orders": "GET /repair_order",
                "get_order_by_id": "GET /repair_order?id=eq.1",
                "create_order": "POST /repair_order",
                "update_order": "PATCH /repair_order?id=eq.1"
            },
            "important_notes": [
                "No uses credenciales de base de datos directas",
                "Todas las consultas deben pasar por MCP",
                "Los schemas disponibles son 'system' y 'customer'",
                "Usa PostgREST syntax para las consultas"
            ]
        }

# Instancia global del servicio
mcp_service = MCPService()