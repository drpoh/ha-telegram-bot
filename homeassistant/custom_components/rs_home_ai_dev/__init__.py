"""Conversation bridge for isolated RS Home AI DEV."""
import asyncio
import aiohttp
from homeassistant.components import conversation
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers import intent
from .const import DOMAIN, CONF_API_URL, CONF_API_TOKEN

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    conversation.async_set_agent(hass, entry, RSHomeAIConversation(hass, entry))
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    conversation.async_unset_agent(hass, entry)
    return True

class RSHomeAIConversation(conversation.AbstractConversationAgent):
    def __init__(self, hass, entry):
        self.hass = hass
        self.entry = entry

    @property
    def supported_languages(self):
        return ["ru"]

    @property
    def supports_control(self):
        return True

    async def async_process(self, user_input: conversation.ConversationInput) -> conversation.ConversationResult:
        session = async_get_clientsession(self.hass)
        response = intent.IntentResponse(language=user_input.language)
        try:
            async with asyncio.timeout(65):
                async with session.post(
                    self.entry.data[CONF_API_URL] + "/ask",
                    headers={"Authorization": "Bearer " + self.entry.data[CONF_API_TOKEN]},
                    json={"text": user_input.text, "conversation_id": user_input.conversation_id},
                ) as result:
                    result.raise_for_status()
                    body = await result.json()
            if not body.get("success") or not isinstance(body.get("answer"), str):
                raise ValueError("Invalid DEV response")
            response.async_set_speech(body["answer"])
        except (aiohttp.ClientError, asyncio.TimeoutError, ValueError):
            response.async_set_speech("RS Home AI временно недоступен. Попробуйте ещё раз.")
            response.async_set_error(intent.IntentResponseErrorCode.UNKNOWN, "DEV API unavailable")
        return conversation.ConversationResult(response=response, conversation_id=user_input.conversation_id)
