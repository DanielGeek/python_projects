"""
Tenant Manager - Multi-tenant configuration management
Handles loading, validation, and formatting of tenant-specific configurations
"""
import json
import os
from typing import Dict, Any, Optional


class TenantManager:
    """Manages loading and validation of tenant configurations"""
    
    def __init__(self, tenants_dir: str = "tenants"):
        self.tenants_dir = tenants_dir
        self._cache: Dict[str, Dict[str, Any]] = {}
    
    def get_tenant_config(self, tenant_id: str) -> Dict[str, Any]:
        """
        Loads tenant configuration from its JSON file
        
        Args:
            tenant_id: Tenant ID (e.g., 'daniel', 'clinica1', 'abogado1')
            
        Returns:
            Dict with complete tenant configuration
            
        Raises:
            FileNotFoundError: If tenant does not exist
        """
        # Check cache
        if tenant_id in self._cache:
            return self._cache[tenant_id]
        
        # Load from file
        config_path = os.path.join(self.tenants_dir, f"{tenant_id}.json")
        
        if not os.path.exists(config_path):
            # Fallback to daniel if not exists
            config_path = os.path.join(self.tenants_dir, "daniel.json")
            if not os.path.exists(config_path):
                raise FileNotFoundError(f"Configuration not found for tenant: {tenant_id}")
        
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # Validate configuration
        self._validate_config(config)
        
        # Save to cache
        self._cache[tenant_id] = config
        
        return config
    
    def _validate_config(self, config: Dict[str, Any]) -> None:
        """Validates that configuration has required fields"""
        required_fields = [
            'tenant_id',
            'company_name',
            'industry',
            'system_prompt_template',
            'welcome_message'
        ]
        
        for field in required_fields:
            if field not in config:
                raise ValueError(f"Invalid configuration: missing field '{field}'")
    
    def get_knowledge_base(self, tenant_id: str) -> str:
        """
        Extracts tenant's knowledge base and formats it as text
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            String with formatted knowledge for system prompt
        """
        config = self.get_tenant_config(tenant_id)
        
        # If has knowledge_base in JSON, use it
        if 'knowledge_base' in config:
            kb = config['knowledge_base']
            return self._format_knowledge_base(kb)
        
        # Otherwise, return empty (will use only system prompt)
        return ""
    
    def _format_knowledge_base(self, kb: Dict[str, Any]) -> str:
        """Formats knowledge base as readable text"""
        sections = []
        
        # About
        if 'about' in kb:
            sections.append(f"ACERCA DE LA EMPRESA:\n{kb['about']}\n")
        
        # Services/Specialties
        sections.extend(self._format_services(kb.get('services')))
        sections.extend(self._format_specialties(kb.get('specialties')))
        
        # FAQs
        sections.extend(self._format_faqs(kb.get('faqs')))
        
        # Contact/Payment info
        if 'payment_methods' in kb:
            sections.append(f"MÉTODOS DE PAGO:\n{kb['payment_methods']}\n")
        
        if 'process' in kb:
            sections.append(f"PROCESO:\n{kb['process']}\n")
        
        return "\n".join(sections)
    
    def _format_services(self, services: Optional[Dict[str, Any]]) -> list:
        """Formats services section"""
        if not services or not isinstance(services, dict):
            return []
        
        sections = ["SERVICIOS:"]
        for service_name, service_data in services.items():
            sections.append(f"\n{service_name.upper().replace('_', ' ')}:")
            if isinstance(service_data, dict):
                for key, value in service_data.items():
                    sections.append(f"  - {key}: {value}")
            else:
                sections.append(f"  {service_data}")
        sections.append("")
        return sections
    
    def _format_specialties(self, specialties: Optional[Dict[str, Any]]) -> list:
        """Formats specialties section"""
        if not specialties or not isinstance(specialties, dict):
            return []
        
        sections = ["ESPECIALIDADES:"]
        for spec_name, spec_data in specialties.items():
            sections.append(f"\n{spec_name.upper().replace('_', ' ')}:")
            if isinstance(spec_data, dict):
                for key, value in spec_data.items():
                    if key == 'doctores':
                        sections.append(f"  - Doctores: {', '.join(value)}")
                    else:
                        sections.append(f"  - {key}: {value}")
        sections.append("")
        return sections
    
    def _format_faqs(self, faqs: Optional[list]) -> list:
        """Formats FAQs section"""
        if not faqs:
            return []
        
        sections = ["PREGUNTAS FRECUENTES:"]
        for faq in faqs:
            sections.append(f"\nP: {faq['question']}")
            sections.append(f"R: {faq['answer']}")
        sections.append("")
        return sections
    
    def get_tools_config(self, tenant_id: str) -> list:
        """
        Gets tenant's tools configuration
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            List of configured tools
        """
        config = self.get_tenant_config(tenant_id)
        return config.get('tools', [])
    
    def get_ui_config(self, tenant_id: str) -> Dict[str, Any]:
        """
        Gets tenant's UI configuration
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            Dict with UI configuration (title, colors, etc.)
        """
        config = self.get_tenant_config(tenant_id)
        
        # UI config
        ui_config = config.get('ui_config', {})
        
        # Branding
        branding = config.get('branding', {})
        
        # Combine both
        return {
            'title': ui_config.get('title', config.get('company_name', 'Chatbot')),
            'subtitle': ui_config.get('subtitle', ''),
            'description': ui_config.get('description', config.get('welcome_message', '')),
            'avatar_emoji': ui_config.get('avatar_emoji', '🤖'),
            'theme': ui_config.get('theme', 'default'),
            'chatbot_height': ui_config.get('chatbot_height', 600),
            'show_share_button': ui_config.get('show_share_button', False),
            'show_copy_button': ui_config.get('show_copy_button', True),
            'placeholder_text': ui_config.get('placeholder_text', 'Escribe tu mensaje...'),
            'submit_button_text': ui_config.get('submit_button_text', 'Enviar'),
            'retry_button_text': ui_config.get('retry_button_text', 'Reintentar'),
            'undo_button_text': ui_config.get('undo_button_text', 'Deshacer'),
            'clear_button_text': ui_config.get('clear_button_text', 'Limpiar'),
            'primary_color': branding.get('primary_color', '#2563eb'),
            'secondary_color': branding.get('secondary_color', '#10b981'),
            'accent_color': branding.get('accent_color', '#ffffff'),
            'background_color': branding.get('background_color', '#f8fafc'),
            'custom_css': branding.get('custom_css', '')
        }
    
    def get_language_config(self, tenant_id: str) -> Dict[str, Any]:
        """
        Gets tenant's language configuration
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            Dict with language configuration
        """
        config = self.get_tenant_config(tenant_id)
        
        return {
            'default_language': config.get('default_language', 'es'),
            'supported_languages': config.get('supported_languages', ['es']),
            'language_detection': config.get('language_detection', True)
        }
    
    def list_available_tenants(self) -> list:
        """Lists all available tenants"""
        if not os.path.exists(self.tenants_dir):
            return []
        
        tenants = []
        for filename in os.listdir(self.tenants_dir):
            if filename.endswith('.json'):
                tenant_id = filename.replace('.json', '')
                tenants.append(tenant_id)
        
        return sorted(tenants)
