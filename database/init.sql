CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    level VARCHAR(50) NOT NULL
);

INSERT INTO courses (title, description, level)
VALUES
(
    'Linux Fundamentals',
    'Learn Linux commands, permissions, processes and networking.',
    'Beginner'
),
(
    'Git & GitHub',
    'Learn repositories, branching, merging and rebase.',
    'Beginner'
),
(
    'Docker',
    'Learn images, containers, Dockerfiles, volumes and networking.',
    'Intermediate'
),
(
    'Kubernetes',
    'Learn Pods, Deployments, Services, Ingress and troubleshooting.',
    'Intermediate'
),
(
    'CI/CD',
    'Build automated pipelines for testing and deployment.',
    'Intermediate'
),
(
    'Cloud & DevOps',
    'Learn cloud infrastructure, monitoring and DevOps practices.',
    'Advanced'
);
