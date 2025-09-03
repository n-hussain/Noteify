"""Remove title, make content optional

Revision ID: b255f411c986
Revises: aa152c6b00a3
Create Date: 2025-09-03 12:05:50.201956

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b255f411c986'
down_revision = 'aa152c6b00a3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("notes", "title")
    op.alter_column("notes", "content",
                    existing_type=sa.String(),
                    nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("notes", sa.Column("title", sa.String(), nullable=False))
    op.alter_column("notes", "content",
                    existing_type=sa.String(),
                    nullable=False)
