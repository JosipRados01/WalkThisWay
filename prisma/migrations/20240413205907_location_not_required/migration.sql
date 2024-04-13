-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "cover" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "eventTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "writerId" INTEGER NOT NULL,
    "performerId" INTEGER,
    "locationId" INTEGER,
    "categoryId" INTEGER,
    CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Performer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("categoryId", "content", "cover", "createdAt", "eventTime", "id", "locationId", "performerId", "title", "updatedAt", "writerId") SELECT "categoryId", "content", "cover", "createdAt", "eventTime", "id", "locationId", "performerId", "title", "updatedAt", "writerId" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
