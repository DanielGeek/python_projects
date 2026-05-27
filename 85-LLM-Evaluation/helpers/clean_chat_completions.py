from openai import AsyncOpenAI

class CleanChatCompletions:
    def __init__(self, original):
        self._original = original

    async def create(self, **kwargs):
        kwargs.pop("max_tokens", None) # Remove max_tokens to prevent OpenAI API errors (max_completion_tokens is already set at the LLM level, invalid_parameter_combination error occurs if max_tokens is also passed in the request)
        return await self._original.create(**kwargs)


class CleanOpenAI(AsyncOpenAI):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chat.completions = CleanChatCompletions(super().chat.completions)
