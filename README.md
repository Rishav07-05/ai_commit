# AI Committer CLI

A command-line tool that uses the power of Google's Gemini AI to automatically generate concise, descriptive commit messages for your staged changes.

![Demo](https://user-images.githubusercontent.com/your-image-url-here.png) <!-- You can replace this with a screenshot of the tool in action -->

## Features

- **AI-Powered**: Generates a 7-word commit message based on your staged diff.
- **Interactive**: Prompts you to accept, reject, or regenerate the message.
- **Automatic Push**: Commits and pushes your changes to GitHub in one go.
- **Simple Workflow**: Just stage your files and run one command.

## Installation

You can install the AI Committer CLI globally via npm, which allows you to run it from any directory on your system.

1. **Prerequisites**: You must have [Node.js](https://nodejs.org/) (version 16 or higher) installed.
2. **Install from GitHub**: Run the following command in your terminal to install the tool directly from this repository.

    ```bash
    npm install -g git+https://github.com/Rishav07-05/ai_commit.git
    ```

This will install the package and make the `ai-commit` command available globally.

## Configuration

The tool requires a Google Gemini API key to function.

1. **Get an API Key**: Obtain your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Set the Environment Variable**: Before running the tool, you must set your API key as an environment variable named `GEMINI_API_KEY`.

    **On macOS and Linux:**
    ```bash
    export GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

    **On Windows (Command Prompt):**
    ```bash
    set GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    *Note: You need to set this variable once per terminal session.*

## Usage

The workflow is designed to be simple and fast.

1. **Make Your Code Changes**: Modify your project files as you normally would.
2. **Stage Your Files**: Use `git add` to stage the files you want to include in the commit.

    ```bash
    git add .
    ```

3. **Run the AI Committer**: Execute the `ai-commit` command.

    ```bash
    ai-commit
    ```

The tool will then:

- Analyze your staged changes.
- Display an AI-generated commit message.
- Prompt you to take action:
  - Type `y` to **commit and push** the changes.
  - Type `n` to **abort** the commit.
  - Type `r` to **regenerate** a new message.

## Development

Interested in contributing? Here’s how to set up the project for local development.

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/Rishav07-05/ai_commit.git
    cd ai_commit
    ```
2. **Install Dependencies**:
    ```bash
    npm install
    ```
3. **Run in Development Mode**:
    The `npm run go` command compiles the code and runs the script, simulating the final workflow.

    ```bash
    # Make sure to set your API key first
    export GEMINI_API_KEY="YOUR_API_KEY_HERE"

    # Stage some files
    git add .

    # Run the development script
    npm run go
    ```

