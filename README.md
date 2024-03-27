# fp-ts-playground

Functional-programming playground

# Run

`yarn`

`yarn test`

# Context

The objective of this repository is to learn and develop skills related to functional programing in Typescript

# Key Points

- Domain Layer: Defines the `User` entity and `UserRepository` interface, encapsulating the business logic and rules.
- Application Layer: Implements the use-case for registering a user, using a `UserRepository` port to interact with user data, demonstrating the decoupling of core logic from external concerns.
- Infrastructure Layer: Provides a concrete implementation of the `UserRepository`, in this case, an in-memory store.
- Hexagonal Architecture: By structuring the application this way, we've adhered to the Hexagonal Architecture principles, where the application core (`domain` and `application` layers) is isolated from external concerns (`infrastructure` layer).
- Functional Programming: The use of `fp-ts` for handling asynchronous operations and errors in a functional style allows for composing operations cleanly and handling errors in a type-safe way.

This structure and approach facilitate testing, maintenance, and the potential to swap out infrastructure implementations (like replacing the in-memory repository with a real database) without changing the application or domain layers.

### Details

- **Property-Based Testing**: Using fast-check, the test generates various user objects to test the registerUser function under different conditions, making the test more robust against edge cases.
- **Handling Asynchronous Operations**: Since registerUser returns a `TaskEither`, we execute it and wait for the result using await. This matches the asynchronous nature of user registration operations, such as database writes, which are simulated here with an in-memory repository.
- **Success and Failure Cases**: The tests check both successful registration and the expected failure when attempting to register a user with an email that already exists in the system. This ensures the function correctly handles both scenarios.
- **Type Safety and Expressiveness**: Leveraging `fp-ts/Option` utilities improves type safety and makes the code more expressive and aligned with functional paradigms. It clearly conveys the intention and allows for easier reasoning about the code's behavior.
- **Maintaining Functional Consistency**: Using constructs from `fp-ts` consistently across your application promotes a uniform coding style that leverages the library's full potential. This ensures that your codebase benefits from functional programming principles, such as immutability and composability, making it more robust and maintainable.
- **Functional Composition**: With repository methods returning `TaskEither`, you can compose these operations with other parts of your application using `fp-ts`'s functional utilities (like pipe and chain), facilitating a purely functional style of error handling and asynchronous operation management.
- **Error Handling**: The save method implementation uses `TE.tryCatch` to wrap the potentially failing operation (like checking for an existing user or pushing a new user to the store) in a way that captures exceptions and converts them into the left side of a `TaskEither`.

These tests provide a solid foundation for ensuring the registerUser function behaves as expected, leveraging the strengths of property-based testing and functional programming with `fp-ts`.
