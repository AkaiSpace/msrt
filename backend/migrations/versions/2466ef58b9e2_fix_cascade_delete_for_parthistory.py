"""Fix cascade delete for PartHistory

Revision ID: 2466ef58b9e2
Revises: 
Create Date: 2025-02-05 01:27:20.931244

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2466ef58b9e2'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('part', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(None, 'car', ['car_id'], ['id'], ondelete='CASCADE')
        batch_op.create_foreign_key(None, 'part_type', ['part_type_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('part_history', schema=None) as batch_op:
        batch_op.alter_column('part_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.create_index(batch_op.f('ix_part_history_part_id'), ['part_id'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('part_history', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_part_history_part_id'))
        batch_op.alter_column('part_id',
               existing_type=sa.INTEGER(),
               nullable=False)

    with op.batch_alter_table('part', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(None, 'car', ['car_id'], ['id'])
        batch_op.create_foreign_key(None, 'part_type', ['part_type_id'], ['id'])

    # ### end Alembic commands ###
