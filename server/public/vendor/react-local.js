/**
 * Smart Campus Embedded React & ReactDOM Standalone Runtime
 * Ensures 100% offline functionality without external CDNs or compilers.
 */
(function(global) {
  let currentComponent = null;
  let hookIndex = 0;
  let rootContainer = null;
  let rootElement = null;
  let renderScheduled = false;

  function createElement(type, props, ...children) {
    const flatChildren = children.flat().filter(c => c !== null && c !== undefined && c !== false);
    return {
      type,
      props: {
        ...(props || {}),
        children: flatChildren.map(child => 
          typeof child === 'object' ? child : createTextElement(child)
        )
      }
    };
  }

  function createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: String(text),
        children: []
      }
    };
  }

  function useState(initial) {
    const component = currentComponent;
    const index = hookIndex++;
    
    if (!component.hooks[index]) {
      component.hooks[index] = {
        state: typeof initial === 'function' ? initial() : initial
      };
    }

    const hook = component.hooks[index];
    const setState = (action) => {
      const nextState = typeof action === 'function' ? action(hook.state) : action;
      if (hook.state !== nextState) {
        hook.state = nextState;
        scheduleRerender();
      }
    };

    return [hook.state, setState];
  }

  function useEffect(effect, deps) {
    const component = currentComponent;
    const index = hookIndex++;
    const oldHook = component.hooks[index];

    const hasChanged = !oldHook || !deps || deps.some((dep, i) => !Object.is(dep, oldHook.deps[i]));

    if (hasChanged) {
      if (oldHook && typeof oldHook.cleanup === 'function') {
        try { oldHook.cleanup(); } catch(e){ console.error(e); }
      }
      component.effects.push(() => {
        const cleanup = effect();
        component.hooks[index] = { deps, cleanup };
      });
    }
  }

  function useMemo(factory, deps) {
    const component = currentComponent;
    const index = hookIndex++;
    const oldHook = component.hooks[index];

    if (!oldHook || !deps || deps.some((dep, i) => !Object.is(dep, oldHook.deps[i]))) {
      const val = factory();
      component.hooks[index] = { val, deps };
      return val;
    }
    return oldHook.val;
  }

  function useCallback(fn, deps) {
    return useMemo(() => fn, deps);
  }

  function scheduleRerender() {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
      renderScheduled = false;
      if (rootContainer && rootElement) {
        renderRoot(rootElement, rootContainer);
      }
    });
  }

  function renderVNode(vnode) {
    if (!vnode) return null;
    if (typeof vnode.type === 'function') {
      const prevComponent = currentComponent;
      const prevIndex = hookIndex;

      // Component instance cache
      if (!vnode._instance) {
        vnode._instance = { hooks: [], effects: [] };
      }
      currentComponent = vnode._instance;
      currentComponent.effects = [];
      hookIndex = 0;

      const rendered = vnode.type(vnode.props);
      const dom = renderVNode(rendered);

      // Run pending effects
      const effectsToRun = [...currentComponent.effects];
      setTimeout(() => {
        effectsToRun.forEach(eff => {
          try { eff(); } catch(e){ console.error(e); }
        });
      }, 0);

      currentComponent = prevComponent;
      hookIndex = prevIndex;
      return dom;
    }

    if (vnode.type === "TEXT_ELEMENT") {
      return document.createTextNode(vnode.props.nodeValue);
    }

    const dom = document.createElement(vnode.type);

    // Apply attributes and event listeners
    const isEvent = key => key.startsWith("on");
    const isProperty = key => key !== "children" && !isEvent(key);

    Object.keys(vnode.props || {}).forEach(name => {
      if (isEvent(name)) {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, vnode.props[name]);
      } else if (name === "className") {
        dom.className = vnode.props[name];
      } else if (name === "style" && typeof vnode.props[name] === 'object') {
        Object.assign(dom.style, vnode.props[name]);
      } else if (isProperty(name)) {
        if (typeof vnode.props[name] === 'boolean') {
          if (vnode.props[name]) dom.setAttribute(name, '');
        } else {
          dom.setAttribute(name, vnode.props[name]);
        }
      }
    });

    (vnode.props.children || []).forEach(child => {
      const childDom = renderVNode(child);
      if (childDom) dom.appendChild(childDom);
    });

    return dom;
  }

  function renderRoot(element, container) {
    rootElement = element;
    rootContainer = container;
    const dom = renderVNode(element);
    container.innerHTML = '';
    if (dom) container.appendChild(dom);
  }

  const LocalReact = {
    createElement,
    useState,
    useEffect,
    useMemo,
    useCallback,
    version: '18.3.0-embedded'
  };

  const LocalReactDOM = {
    createRoot: (container) => ({
      render: (element) => renderRoot(element, container)
    }),
    render: (element, container) => renderRoot(element, container)
  };

  if (!global.React) global.React = LocalReact;
  if (!global.ReactDOM) global.ReactDOM = LocalReactDOM;
})(window);
