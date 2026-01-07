from sqlmodel import SQLModel, create_engine, Session

# This creates a file 'hacktide.db' automatically
sqlite_file_name = "mydemo.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session