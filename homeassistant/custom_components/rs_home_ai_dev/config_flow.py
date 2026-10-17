"""Configuration via the HA UI; never log tokens."""
from urllib.parse import urlsplit
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from .const import DOMAIN, CONF_API_URL, CONF_API_TOKEN

class RSHomeAIFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            url = user_input[CONF_API_URL].rstrip("/")
            parsed = urlsplit(url)
            if parsed.scheme != "http" or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path not in ("", "/"):
                errors["base"] = "invalid_url"
            elif len(user_input[CONF_API_TOKEN]) < 32:
                errors["base"] = "invalid_auth"
            else:
                await self.async_set_unique_id("rs-home-ai-dev")
                self._abort_if_unique_id_configured()
                return self.async_create_entry(title="RS Home AI DEV", data={**user_input, CONF_API_URL: url})
        schema = vol.Schema({
            vol.Required(CONF_API_URL, default="http://192.168.31.124:3312"): str,
            vol.Required(CONF_API_TOKEN): str,
        })
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)
