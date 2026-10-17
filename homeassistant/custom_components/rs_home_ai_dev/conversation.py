"""HA Conversation entity forwarding speech to the authenticated DEV bot."""
import asyncio
import aiohttp
from homeassistant.components import conversation
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers import intent
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from .const import CONF_API_URL, CONF_API_TOKEN

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    async_add_entities([RSHomeAIConversation(entry)])

class RSHomeAIConversation(conversation.ConversationEntity, conversation.AbstractConversationAgent):
    _attr_name = "RS Home AI DEV"
    _attr_unique_id = "rs_home_ai_dev_conversation"

    def __init__(self, entry: ConfigEntry) -> None:
        self.entry = entry

    @property
    def supported_languages(self):
        return ["ru"]

    @property
    def supports_control(self):
        return True

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        conversation.async_set_agent(self.hass, self.entry, self)

    async def async_will_remove_from_hass(self) -> None:
        conversation.async_unset_agent(self.hass, self.entry)
        await super().async_will_remove_from_hass()

    async def _async_handle_message(self, user_input, chat_log):
        return await self._forward(user_input)

    async def _forward(self, user_input: conversation.ConversationInput) -> conversation.ConversationResult:
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
        return conversation.ConversationResult(response=response, conversation_id=user_input.conversation_id)
