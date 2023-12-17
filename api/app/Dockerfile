FROM python:3.8

WORKDIR /source-code

COPY ./source-code .

RUN pip install -r requirements.txt

EXPOSE 80

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]