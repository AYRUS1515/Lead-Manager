
def create_sample_lead(client):
    return client.post(
        "/api/leads",
        json={
            "name": "Arun Kumar",
            "email": "arun@example.com",
            "phone": "9876543210",
            "company": "Tech Solutions",
            "source": "LinkedIn",
            "status": "New"
        }
    )


def test_add_lead(client):
    response = create_sample_lead(client)

    assert response.status_code == 201
    assert response.json["lead"]["name"] == "Arun Kumar"


def test_get_leads(client):
    create_sample_lead(client)

    response = client.get("/api/leads")

    assert response.status_code == 200
    assert len(response.json) == 1


def test_update_lead(client):
    create_sample_lead(client)

    response = client.put(
        "/api/leads/1",
        json={"status": "Contacted"}
    )

    assert response.status_code == 200
    assert response.json["lead"]["status"] == "Contacted"


def test_delete_lead(client):
    create_sample_lead(client)

    response = client.delete("/api/leads/1")

    assert response.status_code == 200


def test_invalid_email(client):
    response = client.post(
        "/api/leads",
        json={
            "name": "Test User",
            "email": "invalid-email",
            "phone": "9876543210"
        }
    )

    assert response.status_code == 400


def test_duplicate_email(client):
    create_sample_lead(client)

    response = create_sample_lead(client)

    assert response.status_code == 409


def test_invalid_status(client):
    response = client.post(
        "/api/leads",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "phone": "9876543210",
            "status": "Hacked"
        }
    )

    assert response.status_code == 400


def test_empty_name(client):
    response = client.post(
        "/api/leads",
        json={
            "name": "",
            "email": "test@example.com",
            "phone": "9876543210"
        }
    )

    assert response.status_code == 400
