-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "company" TEXT,
    "position" TEXT,
    "description" TEXT,
    "product_name" TEXT,
    "memo" TEXT,
    "github_id" TEXT,
    "receipt" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "company" TEXT,
    "position" TEXT,
    "description" TEXT,
    "product_name" TEXT,
    "memo" TEXT,
    "github_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME,
    "location" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "relations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "relations_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "persons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "relations_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "persons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "persons_tags" (
    "person_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    PRIMARY KEY ("person_id", "tag_id"),
    CONSTRAINT "persons_tags_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "persons_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "persons_events" (
    "person_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,

    PRIMARY KEY ("person_id", "event_id"),
    CONSTRAINT "persons_events_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "persons_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
