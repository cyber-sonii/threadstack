INSERT OR IGNORE INTO users (id, display_name, email, password_hash)
VALUES (1, 'Sonia', 'sonia@test.com', 'hashedpassword');

INSERT OR IGNORE INTO channels (id, name, description, created_by)
VALUES 
  (1, 'JavaScript', 'All about JS', 1),
  (2, 'Docker', 'Container discussions', 1),
  (3, 'Python', 'Python programming talk', 1),
  (4, 'DevOps', 'CI/CD and more', 1),
  (5, 'Web Development', 'Frontend and backend', 1),
  (6, 'Data Science', 'Data analysis and ML', 1),
  (7, 'Mobile Development', 'iOS and Android', 1),
  (8, 'Game Development', 'Making games', 1),
  (9, 'Cloud Computing', 'AWS, Azure, GCP', 1),
  (10, 'Security', 'Cybersecurity topics', 1);

INSERT OR IGNORE INTO posts (id, channel_id, author_id, title, body)
VALUES
  (1, 1, 1, 'What is a closure in JavaScript?', 'I keep hearing about closures. Can someone explain it in simple terms?'),
  (2, 1, 1, 'Arrow functions vs regular functions', 'When should I use arrow functions instead of normal functions?'),
  (3, 1, 1, 'Best way to learn async/await?', 'I understand promises a bit, but async/await still confuses me.'),
  (4, 2, 1, 'What are Docker volumes?', 'Can someone explain how Docker volumes work and when to use them?'),
  (5, 2, 1, 'Difference between Docker image and container', 'I am confused about images vs containers. What is the difference?'),
  (6, 2, 1, 'Why use Docker for development?', 'What are the real benefits of using Docker in projects?');

INSERT OR IGNORE INTO replies (id, post_id, parent_reply_id, author_id, body)
VALUES
  (1, 1, NULL, 1, 'A closure happens when a function remembers variables from its outer scope.'),
  (2, 1, NULL, 1, 'Think of it like the function carrying its environment with it.'),
  (3, 4, NULL, 1, 'Volumes let data persist even if the container is removed.');  