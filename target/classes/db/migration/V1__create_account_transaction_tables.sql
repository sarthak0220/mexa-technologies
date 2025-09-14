CREATE TABLE account (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    currency CHAR(3) NOT NULL,
    balance DECIMAL(18,2) DEFAULT 0,
    status VARCHAR(20),
    version INT
);

CREATE TABLE transaction (
    id CHAR(36) PRIMARY KEY,
    account_id CHAR(36),
    type VARCHAR(10),
    amount DECIMAL(18,2),
    status VARCHAR(20),
    narration VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES account(id)
);
