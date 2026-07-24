import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class TifluxAPIClient:
    def __init__(self, api_key: str, client_id: str, desk_id: str):
        self.api_key = api_key
        self.client_id = client_id
        self.desk_id = desk_id
        self.base_url = "https://api.tiflux.com/api/v2"

    async def create_ticket(
        self,
        subject: str,
        description: str,
        requester_name: str = "Usuário SaaS Portal",
        requester_email: str = "user@example.com",
        priority: str = "medium"
    ) -> Optional[dict]:
        """
        Cria um ticket no Tiflux.
        """
        url = f"{self.base_url}/tickets"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Payload mínimo conforme a API
        payload = {
            "client_id": int(self.client_id),
            "desk_id": int(self.desk_id),
            "title": subject,
            "description": description,
            "requestor_name": requester_name,
            "requestor_email": requester_email,
            # priority_id precisaria de um mapeamento real. Estamos omitindo para usar o padrão da mesa, se possível,
            # ou num cenário real, buscaríamos da tabela.
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers, timeout=10.0)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro na API do Tiflux ({e.response.status_code}): {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Erro ao conectar com Tiflux: {e}")
            return None
