
# Lead Manager

A full-stack Lead Management System developed as part of the Meru Technosoft Pvt. Ltd. Full Stack Developer screening assignment.

## Features

- Add new leads
- View all leads
- Edit existing lead details
- Update lead status
- Delete leads with confirmation
- Search leads by name
- Filter leads by status
- Frontend and backend validation
- Duplicate email prevention
- REST API integration
- Automated backend testing

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Axios
- React Router
- Lucide React

### Backend
- Python
- Flask
- Flask-CORS
- Flask-SQLAlchemy
- REST API

### Database
- SQLite

### Testing
- Pytest

## Project Structure

```text
MERU TECH/
|
|-- frontend/
|   |-- src/
|   |-- package.json
|
|-- backend/
|   |-- app/
|   |   |-- __init__.py
|   |   |-- models.py
|   |   |-- routes.py
|   |
|   |-- tests/
|   |   |-- conftest.py
|   |   |-- test_leads.py
|   |
|   |-- config.py
|   |-- run.py
|   |-- requirements.txt
|
|-- .gitignore
|-- README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd "MERU TECH"
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python run.py
```

Backend URL:

http://127.0.0.1:5000

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/leads | Retrieve all leads |
| POST | /api/leads | Create a new lead |
| PUT | /api/leads/{id} | Update a lead |
| DELETE | /api/leads/{id} | Delete a lead |

## Lead Information

Each lead contains:

- ID
- Name
- Email
- Phone
- Company
- Source
- Status

Allowed statuses:

- New
- Contacted
- Qualified
- Converted

## Running Automated Tests

From the backend directory:

```bash
python -m pytest -v
```

## Current Test Results

8 automated backend tests passed.

## Developer

Developed as a full-stack development screening assignment for Meru Technosoft Pvt. Ltd.
