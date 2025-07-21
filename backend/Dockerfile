# Use an official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy app and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port and run the app
EXPOSE 5000
CMD ["python", "app.py"]