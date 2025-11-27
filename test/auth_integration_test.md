# AUTH-7 – Modül Entegrasyon Testleri

Bu doküman AUTH-4, AUTH-5 ve AUTH-6 modüllerinin birlikte doğru çalıştığını test etmek amacıyla hazırlanmıştır.

---

## 1. Register (Kayıt) Testi – AUTH-4

### İstek:
POST /register  
Body:
```json
{
  "username": "hatice",
  "email": "hatice@example.com",
  "password": "123456",
  "passwordConfirm": "123456"
}
