from openai import AsyncOpenAI

class CleanChatCompletions:
    def __init__(self, original):
        self._original = original

    async def create(self, **kwargs):
        kwargs.pop("max_tokens", None)
        return await self._original.create(**kwargs)


class CleanOpenAI(AsyncOpenAI):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chat.completions = CleanChatCompletions(super().chat.completions)
