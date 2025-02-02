from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import date


# Tworzymy instancję aplikacji Flask
app = Flask(__name__)
CORS(app)  # Umożliwia dostęp z różnych domen

# Konfiguracja bazy danych (SQLite w tym przypadku)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Ścieżka do bazy danych
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Wyłączenie powiadomień o zmianach w bazie

# Inicjalizacja SQLAlchemy
db = SQLAlchemy(app)

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

    if 'chassis_number' in data:
        car.chassis_number = data['chassis_number']
    
    if 'driver' in data:
        car.driver = data['driver']

    db.session.commit()
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
        # Pobranie typu części
        part_type = PartType.query.get(part.part_type_id) if part.part_type_id else None
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


#Endpoint do aktualizacji przebiegu części danego samochodu
@app.route('/update-mileage/<int:part_id>', methods=['PUT'])
def update_mileage(part_id):
    part = Part.query.get_or_404(part_id)  # Znajdź część na podstawie ID
    data = request.get_json()

    # Sprawdź, czy przesłano dane do aktualizacji
    if not data or 'mileage' not in data:
        return jsonify({'error': 'Missing required data'}), 400
    
    # Zaktualizuj przebieg części
    part.mileage = data['mileage']
    db.session.commit()  # Zapisz zmiany w bazie danych

    return jsonify({'message': 'Mileage updated successfully!', 'part': {'id': part.id, 'name': part.name, 'mileage': part.mileage}}), 200


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



# Inicjalizacja bazy danych i uruchomienie aplikacji
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
