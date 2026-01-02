"""
Tenant-specific tools for multi-tenant chatbot platform.
Each tenant has 3 custom tools that demonstrate the chatbot's capabilities.
"""
import json
from datetime import datetime
from typing import Dict, Any, Optional


# ============================================================================
# CLINICA1 TOOLS - Healthcare/Medical Clinic
# ============================================================================

def schedule_medical_appointment(
    patient_name: str,
    phone: str,
    email: str,
    specialty: str,
    preferred_date: str,
    preferred_time: str,
    consultation_reason: str,
    first_time: bool = True,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Schedule medical appointment with automatic reminders.
    Demonstrates: Lead capture, appointment scheduling, patient management.
    """
    return {
        "status": "success",
        "appointment_id": f"APPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "message": f"✅ Cita agendada exitosamente para {patient_name}",
        "details": {
            "patient": patient_name,
            "phone": phone,
            "email": email,
            "specialty": specialty,
            "date": preferred_date,
            "time": preferred_time,
            "reason": consultation_reason,
            "first_time": first_time,
            "reminders": "Se enviarán recordatorios 48h y 24h antes vía WhatsApp/SMS"
        },
        "next_steps": [
            "Recibirás confirmación por email",
            "Llega 15 minutos antes para registro",
            "Trae tu cédula y carnet de seguro (si aplica)"
        ]
    }


def query_services_pricing(
    specialty: Optional[str] = None,
    service_type: Optional[str] = None,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Provide detailed information about medical services and pricing.
    Demonstrates: 24/7 information availability, price transparency.
    """
    services_info = {
        "medicina_general": {
            "precio": "$30 - $50",
            "duracion": "30 minutos",
            "incluye": ["Consulta", "Diagnóstico inicial", "Receta médica"]
        },
        "odontologia": {
            "precio": "$40 - $200",
            "duracion": "45-60 minutos",
            "incluye": ["Evaluación", "Limpieza básica", "Plan de tratamiento"]
        },
        "pediatria": {
            "precio": "$35 - $60",
            "duracion": "30 minutos",
            "incluye": ["Control de niño sano", "Vacunación", "Orientación"]
        }
    }
    
    if specialty and specialty.lower().replace(" ", "_") in services_info:
        info = services_info[specialty.lower().replace(" ", "_")]
        return {
            "status": "success",
            "specialty": specialty,
            "price": info["precio"],
            "duration": info["duracion"],
            "includes": info["incluye"],
            "message": f"Información de {specialty} proporcionada"
        }
    
    return {
        "status": "success",
        "available_services": list(services_info.keys()),
        "message": "Consulta disponible para todas las especialidades"
    }


def send_appointment_reminder(
    patient_id: str,
    appointment_date: str,
    appointment_time: str,
    doctor: str,
    contact_method: str = "whatsapp",
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Send automatic appointment reminders via WhatsApp/SMS/Email.
    Demonstrates: Automation, reduced no-shows, improved patient flow.
    """
    return {
        "status": "success",
        "reminder_id": f"REM-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "message": "✅ Recordatorio programado exitosamente",
        "details": {
            "patient_id": patient_id,
            "appointment": f"{appointment_date} a las {appointment_time}",
            "doctor": doctor,
            "method": contact_method,
            "scheduled_sends": [
                f"48 horas antes: {contact_method}",
                f"24 horas antes: {contact_method}",
                "2 horas antes: SMS de confirmación"
            ]
        },
        "impact": "Reduce no-shows en 78% según estudios de la industria"
    }


# ============================================================================
# ABOGADO1 TOOLS - Legal Services/Law Firm
# ============================================================================

def schedule_legal_consultation(
    client_name: str,
    phone: str,
    email: str,
    preferred_date: str,
    preferred_time: str,
    modality: str,
    legal_area: str,
    case_description: str = "",
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Schedule legal consultation with case intake.
    Demonstrates: Lead capture 24/7, case qualification, client onboarding.
    """
    return {
        "status": "success",
        "consultation_id": f"CONS-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "message": f"✅ Consulta legal agendada para {client_name}",
        "details": {
            "client": client_name,
            "phone": phone,
            "email": email,
            "date": preferred_date,
            "time": preferred_time,
            "modality": modality,
            "legal_area": legal_area,
            "description": case_description or "Por definir en consulta"
        },
        "next_steps": [
            "Recibirás confirmación por email con enlace de pago",
            "Consulta inicial: $50 (1 hora)",
            f"Modalidad: {modality}",
            "Prepara documentos relevantes al caso"
        ],
        "captured_value": "Lead calificado fuera de horario laboral"
    }


def query_legal_fees(
    legal_area: str,
    complexity: str = "media",
    estimated_time: str = "",
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Provide fee estimates based on case type and complexity.
    Demonstrates: Price transparency, objection handling, faster sales cycle.
    """
    base_fees = {
        "civil": {"baja": "$500-800", "media": "$1,000-2,500", "alta": "$3,000-8,000"},
        "penal": {"baja": "$1,000-2,000", "media": "$2,500-5,000", "alta": "$5,000-15,000"},
        "laboral": {"baja": "$400-700", "media": "$800-1,500", "alta": "$1,500-3,000"},
        "familia": {"baja": "$600-1,000", "media": "$1,200-2,500", "alta": "$2,500-5,000"},
        "mercantil": {"baja": "$800-1,500", "media": "$1,500-4,000", "alta": "$4,000-10,000"}
    }
    
    area_key = legal_area.lower()
    if area_key in base_fees:
        fee_range = base_fees[area_key].get(complexity.lower(), base_fees[area_key]["media"])
        return {
            "status": "success",
            "legal_area": legal_area,
            "complexity": complexity,
            "estimated_fees": fee_range,
            "includes": [
                "Consulta inicial",
                "Análisis del caso",
                "Estrategia legal",
                "Representación en audiencias"
            ],
            "payment_methods": "Efectivo, transferencia, tarjeta, planes de pago disponibles",
            "message": "Estimación proporcionada - Consulta inicial para cotización exacta"
        }
    
    return {
        "status": "success",
        "message": "Consulta inicial requerida para cotización precisa",
        "available_areas": list(base_fees.keys())
    }


def send_legal_documents(
    client_id: str,
    document_type: str,
    case_id: str,
    client_email: str,
    requires_signature: bool = False,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Send legal documents with tracking and e-signature capability.
    Demonstrates: Document automation, client portal, digital workflow.
    """
    return {
        "status": "success",
        "send_id": f"DOC-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "message": "✅ Documentos enviados exitosamente",
        "details": {
            "client_id": client_id,
            "document_type": document_type,
            "case_id": case_id,
            "recipient": client_email,
            "requires_signature": requires_signature,
            "send_method": "Email seguro con enlace de descarga",
            "tracking": "Notificación cuando el cliente abra el documento"
        },
        "features": [
            "Firma electrónica integrada" if requires_signature else "Solo lectura",
            "Versionado automático",
            "Historial de accesos",
            "Recordatorios automáticos si no se firma"
        ],
        "impact": "Reduce tiempo de gestión documental en 65%"
    }


# ============================================================================
# DANIEL TOOLS - Career/Portfolio (existing tools)
# ============================================================================

def record_user_details(
    email: str,
    name: str = "Name not provided",
    notes: str = "not provided",
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """Record user contact details for follow-up."""
    return {
        "recorded": "ok",
        "email": email,
        "name": name,
        "notes": notes,
        "message": "Contact information recorded successfully"
    }


def record_unknown_question(
    question: str,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """Record questions that couldn't be answered."""
    return {
        "recorded": "ok",
        "question": question,
        "message": "Question recorded for review"
    }


def record_job_offer(
    company_name: str,
    position: str,
    salary: str,
    currency: str,
    work_type: str,
    duration: str = "",
    additional_details: str = "",
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """Record job offer details."""
    return {
        "recorded": "ok",
        "company": company_name,
        "position": position,
        "salary": f"{salary} {currency}",
        "type": work_type,
        "message": "Job offer recorded successfully"
    }


# ============================================================================
# TOOL REGISTRY - Maps tenant_id to their tools
# ============================================================================

TENANT_TOOLS = {
    "clinica1": {
        "functions": [
            schedule_medical_appointment,
            query_services_pricing,
            send_appointment_reminder
        ],
        "schemas": [
            {
                "type": "function",
                "function": {
                    "name": "schedule_medical_appointment",
                    "description": "CRITICAL: You MUST call this tool IMMEDIATELY when you have: patient_name, phone, email, specialty, preferred_date, preferred_time, and consultation_reason. DO NOT say 'your appointment is scheduled' without calling this tool first. Call this tool BEFORE telling the patient their appointment is confirmed. Example: If patient says 'ok gracias' after you ask for reminder preference, that means you have all data - CALL THIS TOOL NOW.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "patient_name": {"type": "string", "description": "Nombre completo del paciente"},
                            "phone": {"type": "string", "description": "Número de teléfono de contacto"},
                            "email": {"type": "string", "description": "Email del paciente"},
                            "specialty": {"type": "string", "description": "Especialidad médica requerida"},
                            "preferred_date": {"type": "string", "description": "Fecha preferida para la cita"},
                            "preferred_time": {"type": "string", "description": "Hora preferida para la cita"},
                            "consultation_reason": {"type": "string", "description": "Motivo de la consulta"},
                            "first_time": {"type": "boolean", "description": "Si es primera vez en la clínica"}
                        },
                        "required": ["patient_name", "phone", "email", "specialty", "preferred_date", "preferred_time", "consultation_reason"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "query_services_pricing",
                    "description": "Use this tool when patients ask about medical service prices or specialty costs. Provides detailed pricing information.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "specialty": {"type": "string", "description": "Especialidad médica a consultar"},
                            "service_type": {"type": "string", "description": "Tipo de servicio específico"}
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "send_appointment_reminder",
                    "description": "Use this tool AFTER scheduling an appointment to set up automatic reminders via WhatsApp/SMS.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "patient_id": {"type": "string", "description": "ID del paciente"},
                            "appointment_date": {"type": "string", "description": "Fecha de la cita"},
                            "appointment_time": {"type": "string", "description": "Hora de la cita"},
                            "doctor": {"type": "string", "description": "Nombre del doctor"},
                            "contact_method": {"type": "string", "enum": ["whatsapp", "sms", "email"], "description": "Método de contacto preferido"}
                        },
                        "required": ["patient_id", "appointment_date", "appointment_time", "doctor"]
                    }
                }
            }
        ]
    },
    "abogado1": {
        "functions": [
            schedule_legal_consultation,
            query_legal_fees,
            send_legal_documents
        ],
        "schemas": [
            {
                "type": "function",
                "function": {
                    "name": "schedule_legal_consultation",
                    "description": "CRITICAL: You MUST call this tool IMMEDIATELY when you have: client_name, phone, email, preferred_date, preferred_time, modality, and legal_area. DO NOT say 'your consultation is scheduled' without calling this tool first. Call this tool BEFORE telling the client their consultation is confirmed. If you have all required data, CALL THIS TOOL NOW - do not wait or ask more questions.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "client_name": {"type": "string", "description": "Nombre completo del cliente"},
                            "phone": {"type": "string", "description": "Número de teléfono"},
                            "email": {"type": "string", "description": "Email del cliente"},
                            "preferred_date": {"type": "string", "description": "Fecha preferida"},
                            "preferred_time": {"type": "string", "description": "Hora preferida"},
                            "modality": {"type": "string", "enum": ["presencial", "virtual"], "description": "Modalidad de consulta"},
                            "legal_area": {"type": "string", "description": "Área legal del caso"},
                            "case_description": {"type": "string", "description": "Breve descripción del caso"}
                        },
                        "required": ["client_name", "phone", "email", "preferred_date", "preferred_time", "modality", "legal_area"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "query_legal_fees",
                    "description": "Use this tool when clients ask about legal fees or pricing. Provides fee estimates based on legal area and case complexity.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "legal_area": {"type": "string", "description": "Área legal del caso"},
                            "complexity": {"type": "string", "enum": ["baja", "media", "alta"], "description": "Complejidad estimada del caso"},
                            "estimated_time": {"type": "string", "description": "Tiempo estimado del proceso"}
                        },
                        "required": ["legal_area"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "send_legal_documents",
                    "description": "Use this tool to send legal documents to clients securely with tracking and e-signature capability.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "client_id": {"type": "string", "description": "ID del cliente"},
                            "document_type": {"type": "string", "description": "Tipo de documento legal"},
                            "case_id": {"type": "string", "description": "ID del caso"},
                            "client_email": {"type": "string", "description": "Email del cliente"},
                            "requires_signature": {"type": "boolean", "description": "Si requiere firma electrónica"}
                        },
                        "required": ["client_id", "document_type", "case_id", "client_email"]
                    }
                }
            }
        ]
    },
    "daniel": {
        "functions": [
            record_user_details,
            record_unknown_question,
            record_job_offer
        ],
        "schemas": [
            {
                "type": "function",
                "function": {
                    "name": "record_user_details",
                    "description": "Use this tool to record that a user is interested in being in touch and provided an email address",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "email": {"type": "string", "description": "The email address of this user"},
                            "name": {"type": "string", "description": "The user's name, if they provided it"},
                            "notes": {"type": "string", "description": "Any additional information about the conversation"}
                        },
                        "required": ["email"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "record_unknown_question",
                    "description": "Always use this tool to record any question that couldn't be answered",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "question": {"type": "string", "description": "The question that couldn't be answered"}
                        },
                        "required": ["question"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "record_job_offer",
                    "description": "Use this tool when a user mentions a job offer, work opportunity, or compensation details",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "company_name": {"type": "string", "description": "Company name"},
                            "position": {"type": "string", "description": "Job title or role"},
                            "salary": {"type": "string", "description": "Compensation amount"},
                            "currency": {"type": "string", "description": "Currency (USD, EUR, etc)"},
                            "work_type": {"type": "string", "description": "Type of work (full-time, contract, etc)"},
                            "duration": {"type": "string", "description": "Duration if specified"},
                            "additional_details": {"type": "string", "description": "Other relevant details"}
                        },
                        "required": ["company_name", "position", "salary", "currency", "work_type"]
                    }
                }
            }
        ]
    }
}


def get_tenant_tools(tenant_id: str) -> tuple:
    """
    Get tools and schemas for a specific tenant.
    
    Args:
        tenant_id: Tenant identifier (clinica1, abogado1, daniel)
        
    Returns:
        tuple: (functions_dict, schemas_list)
    """
    tenant_tools = TENANT_TOOLS.get(tenant_id, TENANT_TOOLS["daniel"])
    
    # Create functions dictionary for easy lookup
    functions_dict = {func.__name__: func for func in tenant_tools["functions"]}
    
    return functions_dict, tenant_tools["schemas"]
