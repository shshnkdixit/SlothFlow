# SlothFlow — Do Less, Live More

> A calm, privacy-first AI productivity assistant that turns overwhelming thoughts into manageable action plans.

SlothFlow is an AI-powered productivity dashboard designed to make everyday work feel lighter. It helps users break down messy to-do lists, summarize notes, and prioritize tasks through a simple, calming interface.

Built using **HTML, CSS, and JavaScript**, SlothFlow supports optional local AI inference through [Ollama](https://ollama.com/) and open-weight language models. This allows users to process personal notes on their own machines instead of sending them to a hosted AI API.

You can also explore SlothFlow in demo mode without installing a model.

## Features

- **AI Task Planning** — Turn unstructured thoughts into manageable action steps.
- **Smart Summarization** — Condense lengthy notes into clear, useful summaries.
- **Task Prioritization** — Identify important tasks and decide what to tackle first.
- **Task Management** — Add, complete, filter, and organize everyday tasks.
- **Privacy-Focused** — Keep task data in your browser and optionally run AI locally.
- **Calming Interface** — A responsive dashboard with a relaxing, nature-inspired design.
- **Demo Mode** — Try the core interface without setting up an AI model.
- **Open-Source AI** — Designed to work with locally hosted open-weight models through Ollama.

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Responsive styling and visual design |
| JavaScript | Interactions, task management, and AI integration |
| Ollama | Optional local model runtime |
| Open-weight LLMs | Local text generation and reasoning |
| Browser Local Storage | Persist tasks between sessions |

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
```

Replace `YOUR-USERNAME` and `YOUR-REPOSITORY` with your actual GitHub username and repository name.

### 2. Run SlothFlow

Open `index.html` in your browser.

For a more reliable local development setup, use the Live Server extension in Visual Studio Code.

You can explore the interface and use the built-in demo mode without installing Ollama.

## Enable Local AI with Ollama

To use a real language model locally, install [Ollama](https://ollama.com/) and download a supported model.

For example, run:

```bash
ollama pull llama3.2
```

Start Ollama, then configure SlothFlow with your local Ollama endpoint:

```text
http://localhost:11434
```

Set the model name to:

```text
llama3.2
```

Use the connection test in SlothFlow to check whether the model service is reachable.

**Note:** Browser-based requests to Ollama may require appropriate CORS configuration, depending on your setup. Local inference also requires sufficient system memory and processing resources. Model performance depends on the model and hardware you use.

## Privacy

SlothFlow is designed with privacy in mind.

- Tasks are stored in browser Local Storage.
- When configured for local inference, prompts can be processed by a model running on your own machine.
- The application does not require a hosted AI API key for its local Ollama workflow.
- Demo mode can be used without connecting to a language model.

**Important:** Browser storage is not encrypted, and data may be accessible to anyone using the same browser profile. When local AI is enabled, prompts are sent to the configured Ollama endpoint. Avoid entering sensitive information on devices or endpoints you do not control.

## Why Open-Source AI?

AI should be accessible, adaptable, and respectful of user privacy.

SlothFlow explores how open-weight models and local inference can make useful AI tools available without depending entirely on centralized AI services.

By supporting local model execution, the project gives users more control over where their data is processed, encourages experimentation with different models, and makes it easier to learn how AI applications work.

The goal is simple: **make AI useful without making it unnecessarily complicated.**

## Roadmap

- [x] Responsive productivity dashboard
- [x] Task creation and completion
- [x] Browser-based task persistence
- [x] Demo mode for AI-style productivity tools
- [x] Optional Ollama integration
- [ ] Improved AI-generated task breakdowns
- [ ] Export and import tasks
- [ ] Customizable local model settings
- [ ] Optional offline-first progressive web app support

## Contributing

Contributions, suggestions, and ideas are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request describing your improvements.

## License

This project is open source. Add a `LICENSE` file to specify the license you choose, such as MIT.

## Our Philosophy

You don't have to do everything at once.

SlothFlow helps you slow down, organize your thoughts, and focus on the next meaningful step.

**Less overwhelm. More clarity. One small step at a time.**
