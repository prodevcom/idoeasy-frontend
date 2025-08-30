# Modal Global Context

Este é um sistema de modal global que resolve o problema de ter FORM dentro de FORM e permite gerenciar modais de forma centralizada.

## 🎯 **Problema Resolvido**

- ❌ **Antes**: FORM dentro de FORM causava problemas de validação
- ✅ **Agora**: Modal global sem conflitos de formulário

## 🚀 **Como Usar**

### 1. **Hook useModalContext()**

```typescript
import { useModalContext } from '@/shared/contexts';

function MyComponent() {
  const { openModal, closeModal, isOpen } = useModalContext();

  const handleOpenModal = () => {
    openModal(
      <MyModalContent
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    );
  };

  return (
    <Button onClick={handleOpenModal}>
      Abrir Modal
    </Button>
  );
}
```

### 2. **Abrindo Qualquer Componente como Modal**

```typescript
// Modal simples
openModal(<div>Conteúdo simples</div>);

// Modal com componente complexo
openModal(
  <UserForm
    user={user}
    onSubmit={handleSave}
    onCancel={closeModal}
  />
);

// Modal com props
openModal(
  <ConfirmationDialog
    title="Confirmar exclusão"
    message="Tem certeza?"
    onConfirm={handleDelete}
    onCancel={closeModal}
  />
);
```

### 3. **Estrutura do Modal**

```typescript
// Seu componente deve retornar apenas o conteúdo do modal
function MyModalContent({ onSubmit, onCancel }) {
  return (
    <>
      <ModalHeader>
        <h3>Título</h3>
      </ModalHeader>
      <ModalBody>
        {/* Seu conteúdo aqui */}
      </ModalBody>
      <ModalFooter>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSubmit}>Confirmar</Button>
      </ModalFooter>
    </>
  );
}
```

## 🔧 **Implementação Técnica**

### **ModalContext.tsx**

- Gerencia o estado global dos modais
- `openModal(component, props)` - Abre um modal
- `closeModal()` - Fecha o modal atual
- `isOpen` - Estado do modal

### **GlobalModal.tsx**

- Renderiza o componente passado como modal
- Usa Carbon Design System (ComposedModal)
- Integra com o contexto

### **Providers.tsx**

- Inclui o ModalProvider na árvore de componentes
- Disponibiliza o contexto para toda a aplicação

## 📍 **Localização dos Arquivos**

```
src/shared/
├── contexts/
│   ├── ModalContext.tsx      # Contexto do modal
│   └── index.ts             # Exportações
├── components/
│   ├── GlobalModal.tsx      # Componente modal global
│   └── index.ts             # Exportações
└── providers.tsx            # Providers da aplicação

app/(private)/
└── AppShell.tsx             # Onde o GlobalModal é renderizado
```

## ✨ **Vantagens**

1. **Sem conflitos**: Não há mais FORM dentro de FORM
2. **Centralizado**: Apenas um modal pode estar aberto por vez
3. **Reutilizável**: Qualquer componente pode ser usado como modal
4. **Consistente**: Todos os modais seguem o mesmo padrão visual
5. **Flexível**: Suporta qualquer tipo de conteúdo

## 🎨 **Exemplo de Uso Real**

```typescript
// Em IdentifiersSectionForm.tsx
const { openModal, closeModal } = useModalContext();

const handleOpenModal = () => {
  openModal(
    <AddIdentifierModal
      onSubmit={handleAddIdentifier}
      onCancel={closeModal}
      submitting={submitting}
    />
  );
};
```

## 🔍 **Debug**

O sistema inclui logs no console para debug:

- `openModal` é chamado
- `handleAddIdentifier` é executado
- Dados são convertidos e adicionados à lista
- Modal é fechado automaticamente
