# Academic Issue Tracking System (AITS)

## 📌 Project Overview
The **Academic Issue Tracking System (AITS)** is a web application designed to streamline the process of logging, tracking, and resolving academic record-related issues at **Makerere University**. It provides an efficient workflow for students, lecturers, and administrators to manage academic concerns transparently.

## 🚀 Features
- 📝 **Issue Logging**: Students can report academic issues related to courses, grades, or missing records.
- 📊 **Issue Tracking**: Users can monitor the status of their submitted issues in real time.
- 👩‍🏫 **Role-Based Access Control (RBAC)**: Different user roles (Student, Lecturer, Administrator) with specific permissions.
- 🔄 **API Integration**: RESTful APIs built using **Django REST Framework (DRF)**.
- 🌍 **Modern UI**: Built with **React** and styled using **Tailwind CSS**.
- 📂 **File Attachments**: Users can upload supporting documents.
- 🔐 **Authentication**: Secure user authentication and session management.
- ☁️ **Cloud Deployment**: The application is designed for cloud hosting.

## 🏗️ Tech Stack
| Component       | Technology  |
|---------------|------------|
| Backend       | Django REST Framework |
| Frontend      | React, Tailwind CSS |
| Database      | PostgreSQL |
| Authentication | Django Authentication, JWT |
| Deployment    | Docker, Cloud services |

## 🛠️ Installation & Setup
### 1️⃣ Clone the Repository
```sh
git clone [(https://github.com/nhbi05/ACADEMIC_TRACKING_SYSTEM)]
cd aits-project
```
### 2️⃣ Backend Setup (Django)
```sh
cd backend
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3️⃣ Frontend Setup (React)
```sh
cd frontend
npm install
npm start
```

## 🎯 Usage
- **Students**: Report academic issues and track progress.
- **Lecturers**: Review and verify student issues.
- **Administrators**: Manage and resolve reported academic issues.

## 🔄 Pull Requests
### How to Contribute
We welcome contributions! Follow these steps to submit a pull request:

1. **Fork the Repository**: Click the fork button on GitHub.
2. **Clone Your Fork**: 
   ```sh
   git clone https://github.com/nhbi05/ACADEMIC_TRACKING_SYSTEM
   cd aits-project
   ```
3. **Create a New Branch**: 
   ```sh
   git checkout -b feature-branch
   ```
4. **Make Your Changes**: Implement your feature or fix.
5. **Commit Your Changes**: 
   ```sh
   git add .
   git commit -m "Describe your changes"
   ```
6. **Push to GitHub**: 
   ```sh
   git push origin feature-branch
   ```
7. **Create a Pull Request**: Open a PR on GitHub and describe your changes.

## 📜 License
This project is licensed under the **MIT License**.

## 🤝 Contributors
- **Nansereko Housnah** 
- **Sumayah Kaswa Nabukeera**
- **Suuna Raymond**
- **Tamale denis Valelian**
- **Kewoda Joanitah**


- Open for collaboration! Feel free to fork and contribute. 🚀

## 📬 Contact
For questions or contributions, reach out via [nhousnahishaq@gmail.com/0763634264].

---
🔥 *AITS – Making academic issue tracking seamless!*

