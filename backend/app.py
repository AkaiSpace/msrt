from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Tworzymy instancję aplikacji Flask
app = Flask(__name__)
CORS(app)  # Umożliwia dostęp z różnych domen

# Konfiguracja bazy danych (SQLite w tym przypadku)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Ścieżka do bazy danych
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Wyłączenie powiadomień o zmianach w bazie

# Inicjalizacja SQLAlchemy
db = SQLAlchemy(app)

# Definiujemy modele
class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chassis_number = db.Column(db.String(3), unique=True, nullable=False)
    parts = db.relationship('Part', backref='car', lazy=True, cascade="all, delete-orphan")  # Dodaj cascade

    def __repr__(self):
        return f"<Car {self.chassis_number}>"

class Part(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    mileage = db.Column(db.Integer, nullable=False)
    part_number = db.Column(db.String(100), unique=True, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    part_type_id = db.Column(db.Integer, db.ForeignKey('part_type.id'), nullable=False)

    def __repr__(self):
        return f"<Part {self.name} (Number: {self.part_number})>"

class PartType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    max_mileage = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f"<PartType {self.name}>"

# Funkcja do inicjalizacji bazy danych
def init_db():
    with app.app_context():
        db.create_all()

# Endpointy
@app.route('/')
def home():
    return "Welcome to the Car Parts Management API!"

# Endpointy dla samochodów

@app.route('/add-car', methods=['POST'])
def add_car():
    data = request.get_json()
    if not data or 'chassis_number' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    new_car = Car(chassis_number=data['chassis_number'])
    db.session.add(new_car)
    db.session.commit()

    return jsonify({'message': 'Car added successfully!', 'car': {'chassis_number': new_car.chassis_number}}), 201

@app.route('/get-cars', methods=['GET'])
def get_cars():
    cars = Car.query.all()
    car_list = [{'id': car.id, 'chassis_number': car.chassis_number} for car in cars]
    return jsonify({'cars': car_list})

# Endpoint do pobierania danych pojedynczego samochodu
@app.route('/get-car/<int:car_id>', methods=['GET'])
def get_car(car_id):
    car = Car.query.get_or_404(car_id)
    return jsonify({'car': {'id': car.id, 'chassis_number': car.chassis_number}}), 200


# Endpoint do edycji danych samochodu
@app.route('/update-car/<int:car_id>', methods=['PUT'])
def update_car(car_id):
    car = Car.query.get_or_404(car_id)  # Znajdź samochód na podstawie ID
    data = request.get_json()

    # Sprawdź, czy przesłano dane do aktualizacji
    if not data or 'chassis_number' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    # Zaktualizuj numer nadwozia
    car.chassis_number = data['chassis_number']
    db.session.commit()  # Zapisz zmiany w bazie danych

    return jsonify({'message': 'Car updated successfully!', 'car': {'id': car.id, 'chassis_number': car.chassis_number}}), 200


# Endpoint do usuwania samochodu
@app.route('/delete-car/<int:car_id>', methods=['DELETE'])
def delete_car(car_id):
    car = Car.query.get_or_404(car_id)  # Znajdź samochód na podstawie ID

    # Usuń samochód z bazy danych
    db.session.delete(car)
    db.session.commit()

    return jsonify({'message': 'Car deleted successfully!', 'car_id': car_id}), 200

# Endpointy dla części

@app.route('/add-part', methods=['POST'])
def add_part():
    data = request.get_json()
    if not data or 'name' not in data or 'mileage' not in data or 'part_number' not in data or 'car_id' not in data or 'part_type_id' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    new_part = Part(name=data['name'], mileage=data['mileage'], part_number=data['part_number'], car_id=data['car_id'], part_type_id=data['part_type_id'])
    if 'notes' in data:
        new_part.notes = data['notes']

    db.session.add(new_part)
    db.session.commit()

    return jsonify({'message': 'Part added successfully!', 'part': {'name': new_part.name, 'part_number': new_part.part_number}}), 201

@app.route('/get-parts', methods=['GET'])
def get_parts():
    parts = Part.query.all()  # Pobierz wszystkie części
    part_list = []
    for part in parts:
        # Sprawdź, czy część jest przypisana do samochodu
        car_chassis_number = part.car.chassis_number if part.car else None

        # Dodaj dane o części i samochodzie do listy
        part_list.append({
            'id': part.id,
            'name': part.name,
            'mileage': part.mileage,
            'part_number': part.part_number,
            'notes': part.notes,
            'car_id': part.car_id,
            'car_chassis_number': car_chassis_number,  # Numer nadwozia samochodu
            'part_type_id': part.part_type_id
        })

    return jsonify({'parts': part_list})

# Endpoint do pobierania danych pojedynczej części
@app.route("/get-part/<int:part_id>", methods=["GET"])
def get_part(part_id):
    part = Part.query.get(part_id)
    if not part:
        return jsonify({"error": "Część nie została znaleziona"}), 404

    return jsonify({
        "part": {
            "id": part.id,
            "name": part.name,
            "part_number": part.part_number,
            "mileage": part.mileage,
            "notes": part.notes,
            "car_chassis_number": part.car.chassis_number if part.car else None
        }
    }), 200


# Endpoint do usuwania części
@app.route('/delete-part/<int:part_id>', methods=['DELETE'])
def delete_part(part_id):
    part = Part.query.get_or_404(part_id)  # Znajdź część na podstawie ID

    # Usuń część z bazy danych
    db.session.delete(part)
    db.session.commit()

    return jsonify({'message': 'Part deleted successfully!', 'part_id': part_id}), 200
    

# Endpoint do edycji danych części

@app.route('/update-part/<int:part_id>', methods=['PUT'])

def update_part(part_id):

    part = Part.query.get_or_404(part_id)  # Znajdź część na podstawie ID
    data = request.get_json()

    # Sprawdź, czy przesłano dane do aktualizacji
    if not data or 'name' not in data or 'mileage' not in data or 'part_number' not in data or 'car_id' not in data or 'part_type_id' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    # Zaktualizuj dane części
    part.name = data['name']
    part.mileage = data['mileage']
    part.part_number = data['part_number']
    part.car_id = data['car_id']
    part.part_type_id = data['part_type_id']
    if 'notes' in data:
        part.notes = data['notes']

    db.session.commit()  # Zapisz zmiany w bazie danych

    return jsonify({'message': 'Part updated successfully!', 'part': {'id': part.id, 'name': part.name, 'mileage': part.mileage, 'part_number': part.part_number, 'notes': part.notes, 'car_id': part.car_id, 'part_type_id': part.part_type_id}}), 200

# Endpoint do dodawania nowego typu części
@app.route('/add-part-type', methods=['POST'])
def add_part_type():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    # Tworzymy nowy typ części
    new_part_type = PartType(name=data['name'])
    if 'max_mileage' in data:
        new_part_type.max_mileage = data['max_mileage']

    # Dodajemy do bazy danych
    db.session.add(new_part_type)
    db.session.commit()

    return jsonify({'message': 'Part type added successfully!', 'part_type': {'id': new_part_type.id, 'name': new_part_type.name, 'max_mileage': new_part_type.max_mileage}}), 201

# Endpoint do pobierania wszystkich typów części
@app.route('/get-part-types', methods=['GET'])
def get_part_types():
    part_types = PartType.query.all()
    part_type_list = [{'id': pt.id, 'name': pt.name, 'max_mileage': pt.max_mileage} for pt in part_types]
    return jsonify({'part_types': part_type_list})

# Endpoint do aktualizacji typu części
@app.route('/update-part-type/<int:part_type_id>', methods=['PUT'])
def update_part_type(part_type_id):
    part_type = PartType.query.get_or_404(part_type_id)  # Znajdź typ części na podstawie ID
    data = request.get_json()

    # Sprawdź, czy przesłano dane do aktualizacji
    if not data or 'name' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    # Zaktualizuj dane typu części
    part_type.name = data['name']
    if 'max_mileage' in data:
        part_type.max_mileage = data['max_mileage']

    db.session.commit()  # Zapisz zmiany w bazie danych

    return jsonify({'message': 'Part type updated successfully!', 'part_type': {'id': part_type.id, 'name': part_type.name, 'max_mileage': part_type.max_mileage}}), 200

# Endpoint do usuwania typu części
@app.route('/delete-part-type/<int:part_type_id>', methods=['DELETE'])
def delete_part_type(part_type_id):
    part_type = PartType.query.get_or_404(part_type_id)  # Znajdź typ części na podstawie ID

    # Usuń typ części z bazy danych
    db.session.delete(part_type)
    db.session.commit()

    return jsonify({'message': 'Part type deleted successfully!', 'part_type_id': part_type_id}), 200

@app.route('/get-parts-for-car/<int:car_id>', methods=['GET'])
def get_parts_for_car(car_id):
    parts = Part.query.filter_by(car_id=car_id).all()  # Pobranie części przypisanych do auta

    part_list = []
    for part in parts:
        part_type = PartType.query.get(part.part_type_id)  # Pobranie typu części na podstawie part_type_id
        max_mileage = part_type.max_mileage if part_type else None

        # Obliczenie zużycia w procentach
        usage_percentage = None
        if max_mileage and max_mileage > 0:
            usage_percentage = round((part.mileage / max_mileage) * 100, 2)

        part_list.append({
            'id': part.id,
            'name': part.name,
            'part_number': part.part_number,
            'mileage': part.mileage,
            'notes': part.notes,
            'part_type_name': part_type.name if part_type else None,
            'max_mileage': max_mileage,
            'usage_percentage': usage_percentage
        })

    return jsonify({'parts': part_list})





# Inicjalizacja bazy danych i uruchomienie aplikacji
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
