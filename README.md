# Ticketing Microservices

## Project Overview

This project is a sophisticated ticketing system built using a microservices architecture, showcasing modern, scalable application design and development practices.

## Getting Started

To run the project successfully, follow these steps:

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **[Node.js](https://nodejs.org/)**: JavaScript runtime environment.
- **[pnpm](https://pnpm.io/installation)**: Fast, disk space efficient package manager.
- **[Docker](https://www.docker.com/get-started)**: Platform for developing, shipping, and running applications inside containers.
- **[Kubernetes](https://kubernetes.io/docs/tasks/tools/)**: Container orchestration system for automating application deployment, scaling, and management.
- **[Skaffold](https://skaffold.dev/docs/install/)**: Command line tool that facilitates continuous development for Kubernetes applications.

### **Clone the Repository**:
    ```sh
    git clone <repository_url>
    cd <repository_directory>
    ```

### **Set Up JWT Secret**:
    ```sh
    kubectl create secret generic jwt-secret --from-literal JWT_SECRET=your_secret_key
    ```

### **Set Up Kubernetes Secrets for Stripe**:
    ```sh
    kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=your_secret_key
    ```

### **Install Dependencies**:
    ```sh
    pnpm install
    ```

### **Start the Kubernetes Cluster**:
    ```sh
    skaffold dev
    ```

By following these steps, you can set up and run the project locally, ensuring all services, including payments, are properly configured and operational.

## Architecture and Technology Stack

### Core Architecture

- **Microservices**: Multiple independent services (Auth, Tickets, Orders, Payments) each responsible for specific business functionalities.
- **Event-Driven Design**: Inter-service communication via NATS Streaming, ensuring loose coupling and high scalability.
- **Database Per Service**: Implemented to ensure data independence and service autonomy, using MongoDB.

### Key Technologies

- **Kubernetes**: Orchestrates container deployment, scaling, and management.
- **Docker**: Containerizes each service for consistency across environments.
- **TypeScript & Express.js**: Primary languages and frameworks for service development.
- **NATS Streaming**: Facilitates reliable, asynchronous communication between services.
- **MongoDB**: Database solution for persistent data storage, configured with replica sets.
- **Next.js**: Used for the client-side application.
- **Stripe**: Integrated for handling payments.

### Infrastructure and DevOps

- **Skaffold**: Facilitates continuous development with Kubernetes.
- **GitHub Actions**: Potential CI/CD pipeline (based on project structure).
- **Ingress-Nginx**: Manages external access to the services.

## System Components

The system comprises several microservices, including:

- Auth Service
- Tickets Service
- Orders Service
- Payments Service
- Client (Next.js application)

Each service is independently deployable and scalable, maintaining data consistency through event-based communication.

## Development Approach

This project emphasizes:

- Cloud-native development practices
- Scalable and maintainable code architecture
- Robust testing strategies (using Vitest)
- Efficient inter-service communication
- Secure authentication using JWT

## Notable Features

- **Authentication**: Implements JWT for secure, stateless authentication across services.
- **Transactional Operations**: Uses MongoDB transactions for data consistency.
- **Error Handling**: Custom error handling and middleware for consistent error responses.
- **Environment Flexibility**: Configurable for different environments (development, testing, production).
- **Payments**: Integrated Stripe for secure and reliable payment processing.

The architecture and technology choices reflect a commitment to building resilient, scalable systems capable of handling complex business requirements in a distributed environment.