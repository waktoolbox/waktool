package com.waktoolbox.waktool.utils.mapper;

import java.util.List;

public interface TemplateMapper<A, B> {
    B to(A a);

    A from(B b);

    List<B> to(List<A> as);

    List<A> from(List<B> bs);
}
