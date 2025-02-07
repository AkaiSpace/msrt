from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import date, datetime, timezone
timestamp=datetime.now(timezone.utc)
import json


# Tworzymy instancję aplikacji Flask
app = Flask(__name__)
CORS(app)  # Umożliwia dostęp z różnych domen

# Konfiguracja bazy danych (SQLite w tym przypadku)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Ścieżka do bazy danych
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Wyłączenie powiadomień o zmianach w bazie

# Inicjalizacja SQLAlchemy
db = SQLAlchemy(app)
migrate = Migrate(app, db)


#Definicja car
class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chassis_number = db.Column(db.String(3), unique=True, nullable=False)
    driver = db.Column(db.String(100), nullable=False)
    parts = db.relationship('Part', backref='car', lazy=True, cascade="all, delete-orphan")
    events = db.relationship('Event', secondary='car_event', back_populates='cars')

def __repr__(self):
    return f"<Car {self.chassis_number}, Driver: {self.driver}>"


class Part(db.Model):
    __tablename__ = "part"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    mileage = db.Column(db.Integer, nullable=False)
    part_number = db.Column(db.String(100), unique=True, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    car_id = db.Column(db.Integer, db.ForeignKey("car.id", ondelete="CASCADE"), nullable=False)
    part_type_id = db.Column(db.Integer, db.ForeignKey("part_type.id", ondelete="CASCADE"), nullable=False)

    # Relacja z historią zmian części
    history = db.relationship(
        "PartHistory",
        back_populates="part",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="dynamic"  # Dzięki temu możemy robić np. part.history.filter(...)
    )

    def __repr__(self):
        return f"<Part {self.name} (Number: {self.part_number})>"


class PartType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    max_mileage = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f"<PartType {self.name}>"
    
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)  # Automatycznie ustawi dzisiejszą datę
    notes = db.Column(db.Text, nullable=True)
    cars = db.relationship('Car', secondary='car_event', back_populates='events')

def __repr__(self):
    return f"<Event {self.name} ({self.date})>"


car_event = db.Table(
    'car_event',
    db.Column('car_id', db.Integer, db.ForeignKey('car.id'), primary_key=True),
    db.Column('event_id', db.Integer, db.ForeignKey('event.id'), primary_key=True)
)

class PartHistory(db.Model):
    __tablename__ = "part_history"

    id = db.Column(db.Integer, primary_key=True)
    part_id = db.Column(db.Integer, db.ForeignKey("part.id", ondelete="CASCADE"), index=True)
    changed_field = db.Column(db.String(100), nullable=False)
    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)

    part = db.relationship("Part", back_populates="history")

    def __repr__(self):
        return f"<PartHistory part_id={self.part_id}, field={self.changed_field}, timestamp={self.timestamp}>"
    
class CarHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    changed_field = db.Column(db.String(50), nullable=False)
    old_value = db.Column(db.String(255))
    new_value = db.Column(db.String(255))

    car = db.relationship('Car', backref=db.backref('history', lazy=True))




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
    
    if not data or 'chassis_number' not in data or 'driver' not in data:
        return jsonify({'error': 'Missing required data'}), 400
    
    new_car = Car(chassis_number=data['chassis_number'], driver=data['driver'])
    db.session.add(new_car)
    db.session.commit()

    return jsonify({'message': 'Car added successfully!', 'car': {
        'id': new_car.id,
        'chassis_number': new_car.chassis_number,
        'driver': new_car.driver
    }}), 201



# Endpoint do pobierania danych wszystkich samochodów
@app.route('/get-cars', methods=['GET'])
def get_cars():
    cars = Car.query.all()
    car_list = []
    for car in cars:
        # Jeśli samochód ma wydarzenia, sortujemy je po dacie malejąco
        last_event = None
        if car.events:
            last_event = sorted(car.events, key=lambda event: event.date, reverse=True)[0]  # Wybieramy najnowsze wydarzenie
        car_list.append({
            'id': car.id,
            'chassis_number': car.chassis_number,
            'driver': car.driver,
            'last_event': last_event.name if last_event else "Brak wydarzeń"
        })
    return jsonify({'cars': car_list})




# Endpoint do pobierania danych pojedynczego samochodu
@app.route('/get-car/<int:car_id>', methods=['GET'])
def get_car(car_id):
    car = Car.query.get_or_404(car_id)
    
    return jsonify({
        'id': car.id,
        'chassis_number': car.chassis_number,
        'driver': car.driver,
        'events': [event.name for event in car.events]  # Lista nazw wydarzeń, w których uczestniczył samochód
    })



# Endpoint do edycji danych samochodu
@app.route('/update-car/<int:car_id>', methods=['PUT'])
def update_car(car_id):
    car = Car.query.get_or_404(car_id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Sprawdź, czy zmienia się numer nadwozia
    if 'chassis_number' in data and data['chassis_number'] != car.chassis_number:
        # Zapisz starą wartość w historii
        history_entry = CarHistory(
            car_id=car.id,
            changed_field="chassis_number",
            old_value=car.chassis_number,
            new_value=data['chassis_number'],
            timestamp=datetime.utcnow()
        )
        db.session.add(history_entry)
        car.chassis_number = data['chassis_number']  # Zaktualizuj numer nadwozia

    # Sprawdź, czy zmienia się kierowca
    if 'driver' in data and data['driver'] != car.driver:
        # Zapisz starą wartość w historii
        history_entry = CarHistory(
            car_id=car.id,
            changed_field="driver",
            old_value=car.driver,
            new_value=data['driver'],
            timestamp=datetime.utcnow()
        )
        db.session.add(history_entry)
        car.driver = data['driver']  # Zaktualizuj kierowcę

    # Zapisz zmiany w bazie danych
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update car', 'details': str(e)}), 500

    return jsonify({'message': 'Car updated successfully!', 'car': {
        'id': car.id,
        'chassis_number': car.chassis_number,
        'driver': car.driver
    }}), 200



# Endpoint do usuwania samochodu
@app.route('/delete-car/<int:car_id>', methods=['DELETE'])
def delete_car(car_id):
    car = Car.query.get_or_404(car_id)  # Znajdź samochód na podstawie ID

    # Usuń samochód z bazy danych
    db.session.delete(car)
    db.session.commit()

    return jsonify({'message': 'Car deleted successfully!', 'car_id': car_id}), 200





# Endpointy dla części

# Endpointy dla części

@app.route('/add-part', methods=['POST'])
def add_part():
    data = request.get_json()
    if not data or 'name' not in data or 'mileage' not in data or 'part_number' not in data or 'car_id' not in data or 'part_type_id' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    new_part = Part(
        name=data['name'],
        mileage=data['mileage'],
        part_number=data['part_number'],
        car_id=data['car_id'],
        part_type_id=data['part_type_id']
    )
    
    if 'notes' in data:
        new_part.notes = data['notes']

    db.session.add(new_part)
    db.session.commit()

    # Dodanie wpisu do historii samochodu
    new_history_entry = CarHistory(
        car_id=new_part.car_id,
        changed_field="part_assigned",
        old_value=None,  # Brak starej wartości, bo to nowe przypisanie
        new_value=new_part.name,  # Można wpisać nazwę części lub jej ID
        timestamp=datetime.utcnow()
    )

    db.session.add(new_history_entry)
    db.session.commit()

    return jsonify({'message': 'Part added successfully!', 'part': {'name': new_part.name, 'part_number': new_part.part_number}}), 201


@app.route('/get-parts', methods=['GET'])
def get_parts():
    parts = Part.query.all()  # Pobierz wszystkie części
    part_list = []

    for part in parts:
        # Pobranie typu części
        part_type = db.session.get(PartType, part.part_type_id) if part.part_type_id else None
        max_mileage = part_type.max_mileage if part_type else None

        # Obliczenie zużycia w procentach
        usage_percentage = None
        if max_mileage and max_mileage > 0:
            usage_percentage = round((part.mileage / max_mileage) * 100, 2)

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
            'car_chassis_number': car_chassis_number,
            'part_type_id': part.part_type_id,
            'max_mileage': max_mileage,
            'usage_percentage': usage_percentage  # Dodanie procentu zużycia
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
            "car_id": part.car_id,
            "part_type_id": part.part_type_id,
            
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
    
@app.route('/update-part/<int:part_id>', methods=['PUT'])
def update_part(part_id):
    print("Otrzymane żądanie do update-part:")
    print(json.dumps(request.get_json(), indent=2))  # Wyświetli dane w konsoli
    part = Part.query.get_or_404(part_id)
    data = request.get_json()

    required_fields = ['name', 'mileage', 'part_number', 'car_id', 'part_type_id']
    optional_fields = ['notes']

    if not data or any(field not in data for field in required_fields):
        return jsonify({'error': 'Missing required data'}), 400

    changed_fields = []
    car_change = None  # Zmienna do przechowywania zmiany auta

    # Aktualizacja wymaganych pól
    for field in required_fields:
        if field in data:
            old_value = getattr(part, field)
            new_value = data[field]

            if str(old_value) != str(new_value):
                setattr(part, field, new_value)
                changed_fields.append((field, old_value, new_value))

                # Jeśli zmienia się car_id, zapisz starą i nową wartość
                if field == "car_id":
                    car_change = (old_value, new_value)

    # Aktualizacja opcjonalnych pól
    for field in optional_fields:
        if field in data:
            old_value = getattr(part, field, None)
            new_value = data[field]

            if str(old_value) != str(new_value):
                setattr(part, field, new_value)
                changed_fields.append((field, old_value, new_value))

    # Zapisanie zmian do historii części
    for field, old, new in changed_fields:
        history_entry = PartHistory(
            part_id=part.id,
            changed_field=field,
            old_value=str(old) if old is not None else None,
            new_value=str(new) if new is not None else None,
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(history_entry)

    # Jeśli część została przeniesiona do innego auta, zapisujemy to w car_history
    if car_change:
        old_car_id, new_car_id = car_change
        part_name = part.name  # Zmienna przechowująca nazwę części
        
        car_history_entry = CarHistory(
            car_id=new_car_id,
            changed_field=f"part_moved: {part_name}",
            old_value=str(old_car_id),  # Stary samochód, do którego część była przypisana
            new_value=str(new_car_id),  # Nowy samochód
            timestamp=datetime.utcnow()
        )
        db.session.add(car_history_entry)

        # Zapis historii dla starego samochodu (auta, z którego część została zabrana)
        car_history_entry_old = CarHistory(
            car_id=old_car_id,
            changed_field=f"part_moved: {part_name}",
            old_value=str(old_car_id),  # Nowy samochód, do którego część została przypisana
            new_value=str(new_car_id),  # Stary samochód
            timestamp=datetime.utcnow()
        )
        db.session.add(car_history_entry_old)

    db.session.commit()

    return jsonify({
        'message': 'Part updated successfully!',
        'updated_fields': [{field: {'old': old, 'new': new}} for field, old, new in changed_fields]
    }), 200



#Endpoint do aktualizacji przebiegu części danego samochodu
@app.route('/update-mileage/<int:car_id>', methods=['PUT'])
def update_mileage(car_id):
    data = request.get_json()

    # Sprawdź, czy przesłano dane do aktualizacji
    if not data or 'mileage' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    # Sprawdź, czy mileage jest liczbą
    try:
        new_mileage = int(data['mileage'])
    except (ValueError, TypeError):
        return jsonify({'error': 'Mileage must be a number'}), 400

    # Znajdź wszystkie części przypisane do danego samochodu
    parts = Part.query.filter_by(car_id=car_id).all()
    if not parts:
        return jsonify({'error': 'No parts found for this car'}), 404

    # Zaktualizuj przebieg dla wszystkich części
    updated_parts = []
    for part in parts:
        old_mileage = part.mileage  # Stary przebieg, przed aktualizacją
        part.mileage = new_mileage  # Zaktualizuj przebieg

        # Dodaj wpis do historii zmian
        part_history = PartHistory(
            part_id=part.id,
            changed_field="mileage",
            old_value=old_mileage,
            new_value=new_mileage,
            timestamp=datetime.utcnow(),
            notes=data.get("notes", "")  # Dodaj notatki, jeśli są obecne
        )
        db.session.add(part_history)
        updated_parts.append({'id': part.id, 'name': part.name, 'mileage': part.mileage})

    # Zapisz zmiany w bazie danych
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update mileage', 'details': str(e)}), 500

    return jsonify({'message': 'Mileage updated successfully!', 'updated_parts': updated_parts}), 200

#Endpoint dodatkowy do dodawania przebiegu
@app.route('/add-mileage/<int:car_id>', methods=['PUT'])
def add_mileage(car_id):
    data = request.get_json()

    # Sprawdź, czy przesłano dane do aktualizacji
    if not data or 'parts' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    # Sprawdź, czy `parts` jest listą
    if not isinstance(data['parts'], list):
        return jsonify({'error': 'Parts must be a list'}), 400

    # Znajdź wszystkie części przypisane do danego samochodu
    parts = Part.query.filter_by(car_id=car_id).all()
    if not parts:
        return jsonify({'error': 'No parts found for this car'}), 404

    # Przygotuj mapę części do aktualizacji
    parts_to_update = {part.id: part for part in parts}

    # Zaktualizuj przebieg dla wybranych części
    updated_parts = []
    for part_data in data['parts']:
        part_id = part_data.get('part_id')
        mileage_to_add = part_data.get('mileage')

        # Sprawdź, czy część istnieje
        if part_id not in parts_to_update:
            continue  # Pomijaj nieistniejące części

        # Sprawdź, czy mileage jest liczbą
        try:
            mileage_to_add = int(mileage_to_add)
        except (ValueError, TypeError):
            continue  # Pomijaj nieprawidłowe wartości

        # Zaktualizuj przebieg części
        part = parts_to_update[part_id]
        old_mileage = part.mileage  # Stary przebieg, przed aktualizacją
        part.mileage += mileage_to_add  # Dodaj nowy przebieg do istniejącego

        # Dodaj wpis do historii zmian
        part_history = PartHistory(
            part_id=part.id,
            changed_field="mileage",
            old_value=old_mileage,
            new_value=part.mileage,  # Nowy przebieg po dodaniu
            timestamp=datetime.utcnow(),
            notes=data.get("notes", "")  # Dodaj notatki, jeśli są obecne
        )
        db.session.add(part_history)
        updated_parts.append({'id': part.id, 'name': part.name, 'mileage': part.mileage})

    # Zapisz zmiany w bazie danych
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update mileage', 'details': str(e)}), 500

    return jsonify({'message': 'Mileage added successfully!', 'updated_parts': updated_parts}), 200


#Endpointy dla typów części

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

# Endpoint do pobierania jednego typu części na podstawie ID
@app.route('/get-part-type/<int:id>', methods=['GET'])
def get_part_type(id):
    part_type = PartType.query.get(id)  # Pobieramy typ części po ID
    if part_type:
        # Jeśli typ części istnieje, zwracamy go w odpowiedzi
        return jsonify({'id': part_type.id, 'name': part_type.name, 'max_mileage': part_type.max_mileage})
    else:
        # Jeśli nie znaleziono typu części o podanym ID, zwracamy błąd
        return jsonify({'error': 'Typ części nie znaleziony'}), 404


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


# Endpointy dla wydarzeń

# Endpoint do dodawania nowego wydarzenia

@app.route('/add-event', methods=['POST'])
def add_event():
    data = request.get_json()
    
    if not data or ('name' not in data or 'notes' not in data):
        return jsonify({'error': 'Missing required data'}), 400

    # Tworzymy nowe wydarzenie
    new_event = Event(name=data['name'], notes=data['notes'])

    if 'date' in data:
        try:
            new_event.date = date.fromisoformat(data['date'])  # Konwersja stringa "YYYY-MM-DD" na date
        except ValueError:
            return jsonify({'error': 'Invalid date format, expected YYYY-MM-DD'}), 400

    # Dodajemy do bazy danych
    db.session.add(new_event)
    db.session.commit()

    return jsonify({
        'message': 'Event added successfully!',
        'event': {
            'id': new_event.id,
            'name': new_event.name,
            'date': new_event.date.isoformat(),  # Zapewniamy poprawne zwracanie daty jako string "YYYY-MM-DD"
            'notes': new_event.notes
        }
    }), 201

# Endpoint do pobierania wszystkich wydarzeń
@app.route('/get-events', methods=['GET'])
def get_events():
    events = Event.query.all()
    event_list = []
    
    for event in events:
        # Pobieramy wszystkie numery nadwozi powiązanych z danym wydarzeniem
        car_chassis_numbers = [car.chassis_number for car in event.cars]
        
        event_data = {
            'id': event.id,
            'name': event.name,
            'date': event.date,
            'notes': event.notes,
            'car_chassis_numbers': car_chassis_numbers,  # Lista numerów nadwozi
            'car_ids': [car.id for car in event.cars]  # Lista ID samochodów
        }
        
        event_list.append(event_data)

    return jsonify({'events': event_list})

# Endpoint do pobierania pojedynczego wydarzenia
@app.route('/get-event/<int:id>', methods=['GET'])
def get_event(id):
    # Pobieramy wydarzenie o podanym ID
    event = Event.query.get_or_404(id)
    
    # Pobieramy numery nadwozi powiązane z tym wydarzeniem
    car_chassis_numbers = [car.chassis_number for car in event.cars]
    
    # Przygotowujemy dane do zwrócenia
    event_data = {
        'id': event.id,
        'name': event.name,
        'date': event.date,
        'notes': event.notes,
        'car_chassis_numbers': car_chassis_numbers,  # Lista numerów nadwozi
    }
    
    return jsonify(event_data)



# Endpoint do aktualizacji wydarzenia
@app.route('/update-event/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    # Pobieramy wydarzenie z bazy danych lub zwracamy błąd, jeśli nie istnieje
    event = Event.query.get_or_404(event_id)
    
    # Zbieramy dane z żądania
    data = request.get_json()

    print(f"Received data: {data}")  # Debugowanie - sprawdzamy, jakie dane przyszły

    # Sprawdzamy, czy mamy wymagane dane
    if not data or ('event_name' not in data or 'event_date' not in data):
        return jsonify({'error': 'Missing required data'}), 400

    # Zaktualizuj nazwę i notatki
    event.name = data['event_name']
    event.notes = data.get('notes', event.notes)  # Pozwalamy na aktualizację tylko jeśli 'notes' jest przesłane

    # Jeśli data została przesłana, sprawdzamy jej format i aktualizujemy
    try:
        event.date = date.fromisoformat(data['event_date'])  # Konwersja stringa "YYYY-MM-DD" na date
    except ValueError:
        print(f"Invalid date format received: {data['event_date']}")  # Debugowanie
        return jsonify({'error': 'Invalid date format, expected YYYY-MM-DD'}), 400

    # Zapisz zmiany w bazie danych
    try:
        db.session.commit()
    except Exception as e:
        print(f"Error during commit: {str(e)}")  # Debugowanie
        return jsonify({'error': 'Database commit failed'}), 500

    print(f"Event after update: {event.name}, {event.date}, {event.notes}")  # Debugowanie

    return jsonify({
        'message': 'Event updated successfully!',
        'event': {
            'id': event.id,
            'name': event.name,
            'date': event.date.isoformat(),  # Zapewniamy poprawne zwracanie daty jako string "YYYY-MM-DD"
            'notes': event.notes
        }
    }), 200


# Endpoint do usuwania wydarzenia
@app.route('/delete-event/<int:event_id>', methods=['DELETE'])  
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)  # Znajdź wydarzenie na podstawie ID

    # Usuń wydarzenie z bazy danych
    db.session.delete(event)
    db.session.commit()

    return jsonify({'message': 'Event deleted successfully!', 'event_id': event_id}), 200

# Endpoint do przypisywania samochodu do wydarzenia
@app.route('/add-car-to-event', methods=['POST'])
def add_car_to_event():
    data = request.get_json()

    # Sprawdzamy czy wszystkie wymagane dane są przesłane
    if 'event_id' not in data or 'car_id' not in data:
        return jsonify({'error': 'Missing event_id or car_id'}), 400

    event = Event.query.get(data['event_id'])
    car = Car.query.get(data['car_id'])

    if not event or not car:
        return jsonify({'error': 'Event or Car not found'}), 404

    # Przypisujemy samochód do wydarzenia
    event.cars.append(car)
    db.session.commit()

    return jsonify({'message': 'Car added to event successfully'}), 201


# Endpoint do usuwania samochodu z wydarzenia
@app.route('/remove-car-from-event', methods=['DELETE'])

def remove_car_from_event():
    data = request.get_json()
    if not data or 'car_id' not in data or 'event_id' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    car = Car.query.get(data['car_id'])
    event = Event.query.get(data['event_id'])

    if not car or not event:
        return jsonify({'error': 'Car or event not found'}), 404

    event.cars.remove(car)
    db.session.commit()

    return jsonify({'message': 'Car removed from event successfully!', 'car_id': car.id, 'event_id': event.id}), 200

# Endpoint do pobierania samochodów przypisanych do wydarzenia
@app.route('/get-cars-for-event/<int:event_id>', methods=['GET'])
def get_cars_for_event(event_id):
    event = Event.query.get_or_404(event_id)
    cars = event.cars

    car_list = [{'id': car.id, 'chassis_number': car.chassis_number, 'driver': car.driver} for car in cars]
    return jsonify({'cars': car_list})

# Endpoint do pobierania wydarzeń dla danego samochodu
@app.route('/get-events-for-car/<int:car_id>', methods=['GET'])
def get_events_for_car(car_id):
    car = Car.query.get_or_404(car_id)
    events = car.events

    event_list = [{'id': event.id, 'name': event.name, 'date': event.date, 'notes': event.notes} for event in events]
    return jsonify({'events': event_list})



# Endpoint do pobierania historii edycji części
@app.route('/part-history/<int:part_id>', methods=['GET'])
def get_part_history(part_id):
    # Pobranie historii dla danej części
    history = PartHistory.query.filter_by(part_id=part_id).all()

    # Jeśli nie znaleziono historii, zwróć odpowiednią wiadomość
    if not history:
        return jsonify({'message': 'No history found for this part'}), 404

    # Zwróć historię w formacie JSON
    history_data = []
    for record in history:
        history_data.append({
            'id': record.id,
            'timestamp': record.timestamp,
            'changed_field': record.changed_field,
            'old_value': record.old_value,
            'new_value': record.new_value,
            'notes': record.notes,
        })

    return jsonify({'history': history_data}), 200

#Endpoint do usuwania historii edycji części
@app.route('/delete-part-history/<int:part_id>', methods=['DELETE'])
def delete_part_history(part_id):
    # Usunięcie wszystkich rekordów historii dla danej części
    history_entries = PartHistory.query.filter_by(part_id=part_id).all()
    
    if not history_entries:
        return jsonify({'error': 'No history found for this part'}), 404
    
    # Usuwanie rekordów historii
    for entry in history_entries:
        db.session.delete(entry)
    
    db.session.commit()
    
    return jsonify({'message': f'History for part {part_id} deleted successfully'}), 200


# Endpoint do pobierania historii edycji samochodu
@app.route('/car-history/<int:car_id>', methods=['GET'])
def get_car_history(car_id):
    car = Car.query.get_or_404(car_id)
    history = CarHistory.query.filter_by(car_id=car.id).order_by(CarHistory.timestamp.desc()).all()

    history_data = []
    for record in history:
        history_data.append({
            'id': record.id,
            'timestamp': record.timestamp,
            'changed_field': record.changed_field,
            'old_value': record.old_value,
            'new_value': record.new_value
        })

    return jsonify({'history': history_data})





# Inicjalizacja bazy danych i uruchomienie aplikacji
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
