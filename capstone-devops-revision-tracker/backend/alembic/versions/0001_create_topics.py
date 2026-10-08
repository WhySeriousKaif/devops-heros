from alembic import op
import sqlalchemy as sa


revision = "0001_create_topics"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "topics",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column(
            "priority",
            sa.String(length=20),
            nullable=False,
            server_default="MEDIUM",
        ),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="NOT_STARTED",
        ),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    op.drop_table("topics")

