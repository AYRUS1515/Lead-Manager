
from app import db


class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    phone = db.Column(db.String(20), nullable=False)

    company = db.Column(db.String(100))
    source = db.Column(db.String(50))

    status = db.Column(
        db.String(30),
        nullable=False,
        default="New"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "company": self.company,
            "source": self.source,
            "status": self.status
        }
