import cv2
import face_recognition
import numpy as np
import os
import psycopg2
import datetime
import time
import csv

# --- SETTINGS ---
TARGET_CLASS = 'G8'
TARGET_YEAR = '4ème année'
TARGET_COURSE = 'Virtualisation'

# --- DB CONNECTION ---
conn = psycopg2.connect(
    host="localhost",
    database="emsiportal",
    user="postgres",
    port="5432",
    password="1234"
)
cur = conn.cursor()

# --- GET STUDENTS FROM TARGET CLASS ---
cur.execute("""
    SELECT s.id, s.first_name, s.last_name, s.image_recog, s.student_id
    FROM students s
    JOIN classes c ON s.class = c.name
    WHERE c.name = %s AND c.year = %s
""", (TARGET_CLASS, TARGET_YEAR))
students = cur.fetchall()

known_face_encodings = []
known_face_last_names = []
known_student_ids = []
student_id_map = {}

for sid, fname, lname, img_path, student_code in students:
    if img_path and os.path.isfile(img_path):
        image = face_recognition.load_image_file(img_path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_face_encodings.append(encodings[0])
            known_face_last_names.append(lname)  # Store only last name here
            known_student_ids.append(student_code)
            student_id_map[student_code] = sid

# --- START CAMERA ---
cap = cv2.VideoCapture(0)
present_students = set()
absent_students = set(known_student_ids)

print("Starting attendance recognition...")
start_time = time.time()

while time.time() - start_time < 10:  # 10 seconds detection time
    ret, frame = cap.read()
    if not ret:
        continue

    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)

        if len(face_distances) == 0:
            continue

        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            student_code = known_student_ids[best_match_index]
            last_name = known_face_last_names[best_match_index]

            if student_code not in present_students:
                present_students.add(student_code)
                absent_students.discard(student_code)

            # Scale back up face locations since the frame we detected in was scaled to 1/4 size
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            # Draw rectangle around face
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)

            # Draw filled rectangle below for last name
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 255, 0), cv2.FILLED)

            # Put last name text
            cv2.putText(frame, last_name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.8, (0, 0, 0), 1)

    cv2.imshow('Attendance Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

# --- RECORD ATTENDANCE IN absences TABLE ---
today = datetime.date.today()
now = datetime.datetime.now().time()

for student_code in known_student_ids:
    sid = student_id_map[student_code]
    status = 'present' if student_code in present_students else 'absent'

    cur.execute("""
        INSERT INTO absences (student_id, subject, date, time, status)
        VALUES (%s, %s, %s, %s, %s)
    """, (student_code, TARGET_COURSE, today, now, status))

# --- FETCH EMAILS FOR ALL STUDENTS BEFORE CLOSING CONNECTION ---
cur.execute("""
    SELECT s.student_id, s.first_name, s.last_name, s.email
    FROM students s
    JOIN classes c ON s.class = c.name
    WHERE c.name = %s AND c.year = %s
""", (TARGET_CLASS, TARGET_YEAR))
student_infos = cur.fetchall()

conn.commit()
cur.close()
conn.close()

# --- CREATE CSV FILE ---
csv_filename = f"{TARGET_COURSE.replace(' ', '_')}_Attendance.csv"
with open(csv_filename, mode='w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Student ID', 'Full Name', 'Status', 'Date', 'Email'])  

    for student_id, fname, lname, email in student_infos:
        full_name = f"{fname} {lname}"
        status = 'present' if student_id in present_students else 'absent'
        writer.writerow([student_id, full_name, status, today, email])

print("Attendance recognition finished.")
