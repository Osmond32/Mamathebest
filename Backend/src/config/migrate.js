import bdd from './db.js';

const runMigration = async () => {
  try {
    console.log("Connessione al database in corso...");
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS evacuazioni (
        id_evacuazioni INT AUTO_INCREMENT PRIMARY KEY,
        bambino_id INT NOT NULL,
        data_ora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        tipo VARCHAR(50) NOT NULL DEFAULT 'cacca',
        note TEXT,
        FOREIGN KEY (bambino_id) REFERENCES bambini(id_bambini) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    
    await bdd.query(createTableQuery);
    console.log("Tabella 'evacuazioni' creata o già esistente! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Errore durante la migrazione del database:", error);
    process.exit(1);
  }
};

runMigration();
