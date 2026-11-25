---
title: Langchain quick start guide
description: Most of the things you should learn on day 1 of your langchain journey
date: 2026-11-22
---

# Langchain

> **Audience:** Anyone who want to learn langchain to interact with LLM providers, get structured output, implement tool calling and create simple agents 

These notes are based on following langchain packages  
"langchain==1.5.2"  
"langchain-ollama==1.1.0"  
"langchain-openai==1.8.3"  

---

## Table of Contents

1. [How to use langchain to invoke an LLM ?](#1-invoke-an-llm)
2. [Message Types in langchain](#2-message-types-in-langchain)
3. [How to use ChatOllama class ?](#3-how-to-use-chat-ollama-class)
4. [Using Prompt templates ?](#4-using-prompt-templates)
5. [How to do few shot prompting ?](#5-how-to-do-few-shot-prompting)
6. [Generate structured response using langchain](#6-structured-response)
7. [Runnables ?](#1-runnables)
8. [How to use langchain to invoke an LLM ?](#1-invoke-an-llm)
---

## 1. How to use langchain to invoke an LLM ?
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
    model="qwen3.6:35b-a3b-coding-mxfp8"
)

prompt = "what is 2+2 ?"

resp = llm.invoke(prompt)

print(resp.content)
```

We are using ollama as an LLM provider and using its openai compatible endpoint

---

## 2. Message types in langchain
```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatOpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
    model="qwen3.6:35b-a3b-coding-mxfp8",
    # reasoning_effort="none",  # maps to think=false on Ollama
    extra_body={"reasoning_effort": "none"},
)

print(llm.invoke("Hello, how are you?"))

messages = [
    SystemMessage(content="""You are a helpful assistant that 
    can answer questions and help with tasks."""),
    HumanMessage(content="What is the capital of France?"),
]

print(llm.invoke(messages))
```

---

## 3. How to use ChatOllama class
```python
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatOllama(
    base_url="http://localhost:11434/",
    model="qwen3.6:35b-a3b-coding-mxfp8",
    reasoning=False
)

print(llm.invoke("Hello, how are you?"))

messages = [
    SystemMessage(content="""You are a helpful assistant that 
    can answer questions and help with tasks."""),
    HumanMessage(content="What is the capital of France?"),
]

response = llm.invoke(messages)

print(type(response.content))
```

---

## 4. Using prompt templates
```python
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate


llm = ChatOllama(
    base_url="http://localhost:11434/",
    model="qwen3.6:35b-a3b-coding-mxfp8",
    reasoning=False
)

prompt_template = ChatPromptTemplate(
    [
        ("system", "You are a {subject} teacher"),
        ("human", "Explain me about {concept}")
    ]
)

prompt = prompt_template.invoke({"subject": "chemistry", "concept": "chemical equlibirium"})

print(prompt)

resp = llm.invoke(prompt)

print(resp)
```

---

## 5. How to do few shot prompting
```python
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_ollama import ChatOllama

# 1. Define examples
examples = [
    {
        "ticket": "My laptop is not booting",
        "category": "Incident"
    },
    {
        "ticket": "I need access to the Finance application",
        "category": "Service Request"
    },
    {
        "ticket": "We need to upgrade the production database",
        "category": "Change Request"
    },
]

# 2. Define the format of each example
example_prompt = PromptTemplate(
    input_variables=["ticket", "category"],
    template="""
Ticket: {ticket}
Category: {category}
"""
)

# 3. Create few-shot prompt
few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    prefix="""
You are an ITSM ticket classification assistant.
Classify the following tickets into one of:
Incident, Service Request, Change Request.

Here are some examples:
""",
    suffix="""
Ticket: {input}
Category:
""",
    input_variables=["input"],
)

# 4. Connect with LLM
llm = ChatOllama(
    base_url="http://localhost:11434/",
    model="qwen3.6:35b-a3b-coding-mxfp8",
    reasoning=False
)

chain = few_shot_prompt | llm

response = chain.invoke({
    "input": "Please install Docker Desktop on my laptop"
})

print(response.content)
```

## 6. Generate structured response using langchain

### Using json_schema
```python
from pydantic import BaseModel, Field
from typing import Literal
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="http://127.0.0.1:1234/v1",
    model="google/gemma-4-e4b",
    api_key="abc",
    temperature=0,
)

class IncidentAnalysis(BaseModel):
    category: Literal[
        "network",
        "database",
        "application",
        "security",
        "infrastructure"
    ]

    priority: Literal["P1", "P2", "P3", "P4"]

    affected_service: str

    summary: str

    troubleshooting_steps: list[str]

    requires_escalation: bool

structured_llm = llm.with_structured_output(
    IncidentAnalysis,
    method="json_schema"
)

incident = """
Production database is unavailable.
All application users are unable to access the system.
The database server is not responding.
"""

result = structured_llm.invoke(incident)

print(result)
print(result.category)
print(result.priority)
print(result.troubleshooting_steps)
```


### Using Pydantic output parser
```python
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from pydantic import BaseModel, Field
from typing import Literal


class IncidentAnalysis(BaseModel):
    category: Literal[
        "network",
        "database",
        "application",
        "security",
        "infrastructure"
    ]

    priority: Literal["P1", "P2", "P3", "P4"]

    affected_service: str

    summary: str

    troubleshooting_steps: list[str]

    requires_escalation: bool


llm = ChatOpenAI(
    base_url="http://127.0.0.1:1234/v1",
    model="google/gemma-4-e4b",
    api_key="abc",
    temperature=0,
)


parser = PydanticOutputParser(pydantic_object=IncidentAnalysis)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract incident details.\n{format_instructions}"),
    ("human", "{incident}"),
]).partial(format_instructions=parser.get_format_instructions())
2

incident = """
Production database is unavailable.
All application users are unable to access the system.
The database server is not responding.
"""

chain = prompt | llm | parser
result = chain.invoke({"incident": incident})  # IncidentAnalysis

print(result)
print(result.category)
print(result.priority)
print(result.affected_service)
print(result.summary)
print(result.troubleshooting_steps)
print(result.requires_escalation)
```

## 7. Traces in langchain

### set_verbose
```python
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from pydantic import BaseModel, Field
from typing import Literal

from langchain_core.globals import set_debug, set_verbose


set_verbose(True) # lighter logging


class IncidentAnalysis(BaseModel):
    category: Literal[
        "network",
        "database",
        "application",
        "security",
        "infrastructure"
    ]

    priority: Literal["P1", "P2", "P3", "P4"]

    affected_service: str

    summary: str

    troubleshooting_steps: list[str]

    requires_escalation: bool


llm = ChatOpenAI(
    base_url="http://127.0.0.1:1234/v1",
    model="google/gemma-4-e4b",
    api_key="abc",
    temperature=0,
)


parser = PydanticOutputParser(pydantic_object=IncidentAnalysis)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract incident details.\n{format_instructions}"),
    ("human", "{incident}"),
]).partial(format_instructions=parser.get_format_instructions())
2

incident = """
Production database is unavailable.
All application users are unable to access the system.
The database server is not responding.
"""

chain = prompt | llm | parser
result = chain.invoke({"incident": incident})  # IncidentAnalysis
```


### set_debug
```python
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from pydantic import BaseModel, Field
from typing import Literal

from langchain_core.globals import set_debug

set_debug(True)     # detailed: inputs/outputs of each runnable


class IncidentAnalysis(BaseModel):
    category: Literal[
        "network",
        "database",
        "application",
        "security",
        "infrastructure"
    ]

    priority: Literal["P1", "P2", "P3", "P4"]

    affected_service: str

    summary: str

    troubleshooting_steps: list[str]

    requires_escalation: bool


llm = ChatOpenAI(
    base_url="http://127.0.0.1:1234/v1",
    model="google/gemma-4-e4b",
    api_key="abc",
    temperature=0,
)


parser = PydanticOutputParser(pydantic_object=IncidentAnalysis)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract incident details.\n{format_instructions}"),
    ("human", "{incident}"),
]).partial(format_instructions=parser.get_format_instructions())
2

incident = """
Production database is unavailable.
All application users are unable to access the system.
The database server is not responding.
"""

chain = prompt | llm | parser
result = chain.invoke({"incident": incident})  # IncidentAnalysis


```

## Callback handlers
### Stdout Callback handler
```python
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.callbacks import StdOutCallbackHandler

from pydantic import BaseModel
from typing import Literal


class IncidentAnalysis(BaseModel):
    category: Literal[
        "network",
        "database",
        "application",
        "security",
        "infrastructure"
    ]

    priority: Literal["P1", "P2", "P3", "P4"]

    affected_service: str

    summary: str

    troubleshooting_steps: list[str]

    requires_escalation: bool


llm = ChatOpenAI(
    base_url="http://127.0.0.1:1234/v1",
    model="google/gemma-4-e4b",
    api_key="abc",
    temperature=0,
)


parser = PydanticOutputParser(pydantic_object=IncidentAnalysis)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract incident details.\n{format_instructions}"),
    ("human", "{incident}"),
]).partial(format_instructions=parser.get_format_instructions())

incident = """
Production database is unavailable.
All application users are unable to access the system.
The database server is not responding.
"""

chain = prompt | llm | parser

# StdOutCallbackHandler = lighter console logs for LCEL
# (this is what set_verbose would have done for old Chain classes)
result = chain.invoke(
    {"incident": incident},
    config={"callbacks": [StdOutCallbackHandler()]},
)

print(result)

```

### Console  Callback Handler
```python
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.tracers import ConsoleCallbackHandler

from pydantic import BaseModel
from typing import Literal


class IncidentAnalysis(BaseModel):
    category: Literal[
        "network",
        "database",
        "application",
        "security",
        "infrastructure"
    ]

    priority: Literal["P1", "P2", "P3", "P4"]

    affected_service: str

    summary: str

    troubleshooting_steps: list[str]

    requires_escalation: bool


llm = ChatOpenAI(
    base_url="http://127.0.0.1:1234/v1",
    model="google/gemma-4-e4b",
    api_key="abc",
    temperature=0,
)


parser = PydanticOutputParser(pydantic_object=IncidentAnalysis)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract incident details.\n{format_instructions}"),
    ("human", "{incident}"),
]).partial(format_instructions=parser.get_format_instructions())

incident = """
Production database is unavailable.
All application users are unable to access the system.
The database server is not responding.
"""

chain = prompt | llm | parser

# ConsoleCallbackHandler = detailed logs (same idea as set_debug(True))
# Shows prompts, raw LLM output, parser I/O, timings
result = chain.invoke(
    {"incident": incident},
    config={"callbacks": [ConsoleCallbackHandler()]},
)

print(result)
```

### File callback handler
```python
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.callbacks import FileCallbackHandler

from pydantic import BaseModel
from typing import Literal


class IncidentAnalysis(BaseModel):
    category: Literal[
        "network",
        "database",
        "application",
        "security",
        "infrastructure"
    ]

    priority: Literal["P1", "P2", "P3", "P4"]

    affected_service: str

    summary: str

    troubleshooting_steps: list[str]

    requires_escalation: bool


llm = ChatOpenAI(
    base_url="http://127.0.0.1:1234/v1",
    model="google/gemma-4-e4b",
    api_key="abc",
    temperature=0,
)


parser = PydanticOutputParser(pydantic_object=IncidentAnalysis)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract incident details.\n{format_instructions}"),
    ("human", "{incident}"),
]).partial(format_instructions=parser.get_format_instructions())

incident = """
Production database is unavailable.
All application users are unable to access the system.
The database server is not responding.
"""

chain = prompt | llm | parser

# FileCallbackHandler = light logs to a file (like StdOutCallbackHandler)
# mode="w" overwrites each run; use "a" to append
with FileCallbackHandler("chain_light.log", mode="w") as handler:
    result = chain.invoke(
        {"incident": incident},
        config={"callbacks": [handler]},
    )

print(result)
print("Light logs written to chain_light.log")

```

### Function callback handler
```python
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.tracers.stdout import FunctionCallbackHandler

from pydantic import BaseModel
from typing import Literal


class IncidentAnalysis(BaseModel):
    category: Literal[
        "network",
        "database",
        "application",
        "security",
        "infrastructure"
    ]

    priority: Literal["P1", "P2", "P3", "P4"]

    affected_service: str

    summary: str

    troubleshooting_steps: list[str]

    requires_escalation: bool


llm = ChatOpenAI(
    base_url="http://127.0.0.1:1234/v1",
    model="google/gemma-4-e4b",
    api_key="abc",
    temperature=0,
)


parser = PydanticOutputParser(pydantic_object=IncidentAnalysis)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract incident details.\n{format_instructions}"),
    ("human", "{incident}"),
]).partial(format_instructions=parser.get_format_instructions())

incident = """
Production database is unavailable.
All application users are unable to access the system.
The database server is not responding.
"""

chain = prompt | llm | parser

# FunctionCallbackHandler = detailed logs to a file
# (same detail as ConsoleCallbackHandler / set_debug, but written to disk)
with open("chain_debug.log", "w", encoding="utf-8") as f:
    def write_log(text: str) -> None:
        f.write(text + "\n")
        f.flush()

    handler = FunctionCallbackHandler(write_log)
    result = chain.invoke(
        {"incident": incident},
        config={"callbacks": [handler]},
    )

print(result)
print("Detailed logs written to chain_debug.log")

```

Function callback handler are extremely powerful , think of a usecase , you want to store your agent traces into a remote system . This remote system has exposed a webhook, anything sent to this webhook persisted into a database and this third party system 

---

## 7. Runnables
