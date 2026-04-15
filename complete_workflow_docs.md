# Comprehensive System Workflow: From Login to Delivery

This document traces the journey of a user and a piece of data through the **MINIT** ecosystem, detailing the interplay between the REST API, Redis caching, and the Kafka event-driven backbone.

---

## 1. Authentication & Browsing (The Entrance)

### Step 1: Login & Identity
- **Actor**: User or Vendor.
- **Process**: Hits `/api/auth/login`. The system verifies credentials and issues a **JWT (JSON Web Token)**.
- **Data Flow**: The token is stored on the client and sent in the `Authorization` header for all subsequent requests.

### Step 2: High-Speed Browsing (Powered by Redis)
- **Actor**: User.
- **Process**: Fetches the product catalog via `GET /api/products`.
- **Infrastructure**:
    - **Redis**: The controller checks the `products:all` key. If present, the user receives the list in **sub-millisecond** time.
    - **Real-Time Stock**: When the user clicks a product, `GET /api/products/:id/stock` hits Redis (`stock:<id>`) to show current availability without polling the main database.

> [!TIP]
> **Diagram Prompt 1 (User Interaction):** 
> "A sequence diagram showing a User Client, Express API, Redis Cache, and MongoDB. Show the 'Cache Hit' path returning data from Redis, and the 'Cache Miss' path fetching from MongoDB and populating Redis."

---

## 2. Order Placement (The Trigger)

### Step 3: Fast Check-out
- **Actor**: User.
- **Process**: Hits `POST /api/orders` with an array of items.
- **Logic**:
    1. The **Order Service** saves a new document in MongoDB with `status: "pending"`.
    2. **Kafka Production**: The service calls `produceEvent(TOPICS.ORDER_CREATED, payload)`.
    3. **Immediate Response**: The user receives a confirmation screen *immediately*. They do not wait for stock checks or payment processing.

---

## 3. The Asynchronous Backbone (The Kafka Chain)

The following steps happen in the background, decoupled from the user's request.

### Step 4: Inventory Logic (`inventoryConsumer`)
- **Trigger**: Receives `order_created`.
- **Action**: Performs an **Atomic Stock Update** in MongoDB.
- **Redis Update**: pro-actively updates the `stock:<id>` cache so other users immediately see the reduced quantity.
- **Next Step**: Emits `inventory_checked`.

### Step 5: Payment Processing (`paymentConsumer`)
- **Trigger**: Receives `inventory_checked`.
- **Action**: Communicates with the Payment Gateway (simulated).
- **Next Step**: Emits `payment_completed` (triggering delivery) and `order_status_update` (to sync the DB).

### Step 6: Fulfillment (`deliveryConsumer`)
- **Trigger**: Receives `payment_completed`.
- **Action**: Assigns a delivery partner and estimates time.
- **Next Step**: Emits `order_status_update` (status: `confirmed`) and `delivery_assigned`.

> [!IMPORTANT]
> **Diagram Prompt 2 (Event Flow):** 
> "A flowchart/choreography diagram showing four blocks: Inventory Service, Payment Service, Delivery Service, and Order Service. Use arrows to show the Kafka Event Chain: OrderCreated -> InventoryChecked -> PaymentCompleted -> OrderStatusUpdate. Highlight that all services are linked by a central Kafka Bus."

---

## 4. State Consolidation (`orderConsumer`)

### Step 7: The Source of Truth
- **Process**: The `orderConsumer` is the **only service allowed to modify the Order status** in the database.
- **Safety**: It uses **Optimistic Locking** (calculating current `version`) and **Database Idempotency** to ensure that events arriving out of order (e.g., Delivery confirms before Payment) do not corrupt the record.

---

## 5. Vendor Visibility (The Conclusion)

### Step 8: Vendor Dashboard Update
- **Actor**: Vendor.
- **Process**: The vendor views their dashboard (`GET /api/orders/vendor-sales`).
- **Logic**: The controller queries the `Order` collection.
- **Result**: Because the **Kafka Chain** processed the events efficiently, the vendor sees the order move from `pending` → `confirmed` → `preparing` in near real-time.
- **Revenue**: The dashboard automatically recalculates total revenue and items sold based on the final completed states in the DB.

> [!TIP]
> **Diagram Prompt 3 (End-to-End Consistency):** 
> "An architecture diagram showing a high-level view. On the left: User placing an order. Middle: Kafka Cluster with multiple topics. Right: Separate Consumer Groups updating MongoDB and Redis. Far-right: Vendor Dashboard reading the final consistent state from MongoDB."

---

## Summary of Infrastructure Roles

| Stage | Role of **REDIS** | Role of **KAFKA** |
| :--- | :--- | :--- |
| **Browsing** | Serves catalog & stock instantly | N/A |
| **Ordering** | N/A | Ingests `order_created` request |
| **Processing** | Refreshes stock availability | Coordinates between Inventory/Payment/Delivery |
| **Monitoring** | N/A | Consolidates status updates back to DB |
| **Reporting** | N/A | Ensures eventual consistency for Vendor stats |
