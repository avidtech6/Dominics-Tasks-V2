# State: Singleton Behaviour Instances

**Source:** src/behaviours/ + each component imports its behaviour
**Pattern:** Each Behaviour class is instantiated once and exported. Components import the singleton.

## AuthBehaviour
```typescript
  async setupParentPin(pin: string): Promise<void> {
    // Placeholder implementation
    console.log('Setting up parent pin:', pin);
  }
}
```

## ChatBehaviour
```typescript
    this.messages.push(newMessage);
    this.notify({ type: 'message_sent', message: newMessage });
    return newMessage;
  }
}
```

## FamilyBehaviour
```typescript
      updatedAt: new Date(),
    };
    this.notify({ type: 'family_updated', family: this.family });
  }
}
```

## TaskBehaviour
```typescript

  getDeletedTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'cancelled');
  }
}
```

