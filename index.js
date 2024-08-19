import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { usarBD } from './hooks/usarBD';
import { Produto } from './components/produto';

export function Index() {
    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [pesquisa, setPesquisa] = useState('');
    const [produtos, setProdutos] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    const produtosBD = usarBD();

    async function createOrUpdate() {
        if (isNaN(quantidade)) {
            return Alert.alert('Quantidade', 'A quantidade precisa ser um número!');
        }

        try {
            if (selectedId) {
                await produtosBD.update({
                    id: selectedId,
                    nome,
                    quantidade: Number(quantidade),
                });
                Alert.alert('Produto atualizado com sucesso!');
            } else {
                const item = await produtosBD.create({
                    nome,
                    quantidade: Number(quantidade),
                });
                Alert.alert('Produto cadastrado com o ID: ' + item.idProduto);
                setId(item.idProduto);
            }
            limparCampos();
            listar();
        } catch (error) {
            console.log(error);
        }
    }

    async function listar() {
        try {
            const captura = await produtosBD.read(pesquisa);
            setProdutos(captura);
        } catch (error) {
            console.log(error);
        }
    }

    const limparCampos = () => {
        setNome('');
        setQuantidade('');
        setSelectedId(null);
    };

    useEffect(() => {
        listar();
    }, [pesquisa]);

    const remove = async (id) => {
        try {
            await produtosBD.remove(id);
            await listar();
        } catch (error) {
            console.log(error);
        }
    };

    const selecionarProduto = (produto) => {
        setSelectedId(produto.id);
        setNome(produto.nome);
        setQuantidade(String(produto.quantidade));
    };

    return (
        <View style={styles.container}>
            <TextInput 
                style={styles.input} 
                placeholder="Nome" 
                onChangeText={setNome} 
                value={nome} 
                placeholderTextColor="#888" 
            />
            <TextInput 
                style={styles.input} 
                placeholder="Quantidade" 
                onChangeText={setQuantidade} 
                value={quantidade} 
                keyboardType="numeric" 
                placeholderTextColor="#888" 
            />
            <TouchableOpacity style={styles.button} onPress={createOrUpdate}>
                <Text style={styles.buttonText}>{selectedId ? "Atualizar" : "Salvar"}</Text>
            </TouchableOpacity>
            <TextInput 
                style={styles.input} 
                placeholder="Pesquisar" 
                onChangeText={setPesquisa} 
                placeholderTextColor="#888" 
            />
            <FlatList
                contentContainerStyle={styles.listContent}
                data={produtos}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <Produto
                        data={item}
                        onPress={() => selecionarProduto(item)}
                        isSelected={item.id === selectedId}
                        onDelete={() => remove(item.id)}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    
        flex: 1,
        backgroundColor: '#313D5A',
        padding: 24,
    },
    input: {
        height: 50,
        backgroundColor: '#EAEAEA',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#73628A', // Cor corrigida
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        paddingTop: 16,
        borderRadius: 10,
    },

});
