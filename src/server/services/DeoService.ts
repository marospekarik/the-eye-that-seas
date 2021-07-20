export interface Service {
    getName(): string;
    start(ip: string): void;
    release(): void;
}

export interface ServiceClass {
    getInstance(): Service;
    hasInstance(): boolean;
}
